# Schema

Answer each of these, in your own words.

- Table by table: what columns and types does each one have?
- Which relationships are one-to-many, and which are many-to-many?
- Which constraints are enforced by the database, and which by application code — and why did you draw the line there?
- What did you deliberately denormalise?
- What would break first if this had 100x the data?


MongoDB via Mongoose. Five collections. Types below are Mongoose schema types, not raw BSON.

## User

| Field       | Type                     | Notes |
|-------------|--------------------------|-------|
| `name`      | String, required         | |
| `email`     | String, required, unique | lowercased, trimmed |
| `password`  | String, required         | bcrypt hash, never returned (`.select("-password")` on every read) |
| `role`      | String enum, required    | `sales_manager` \| `sales_rep`, default `sales_rep` |
| `createdAt`/`updatedAt` | Date            | `timestamps: true` |

## Company

| Field       | Type                     | Notes |
|-------------|--------------------------|-------|
| `name`      | String, required         | |
| `industry`  | String, required         | |
| `website`   | String, optional         | |
| `owner`     | ObjectId → User, required| the owning sales rep |
| `archived`  | Boolean, default false   | soft-delete flag |

## Deal

| Field                | Type                        | Notes |
|----------------------|-----------------------------|-------|
| `company`            | ObjectId → Company, required| every deal belongs to exactly one company |
| `title`              | String, required            | |
| `value`              | Decimal128, required        | exact decimal amount — deliberately not a JS `Number`, to avoid floating-point drift on money (see Decision below) |
| `expectedCloseDate`  | Date, required              | |
| `owner`              | ObjectId → User, required   | |
| `stage`              | String enum, required       | `New`\|`Qualified`\|`Proposal`\|`Negotiation`\|`Won`\|`Lost`, default `New` |
| `collaborators`      | [ObjectId → User]           | zero or more |
| `previousStage`      | String enum, nullable       | one of the four open stages; set when a deal closes so "reopen" can restore it |
| `createdAt`/`updatedAt` | Date                     | |

## DealHistory

| Field         | Type                        | Notes |
|---------------|-----------------------------|-------|
| `deal`        | ObjectId → Deal, required   | |
| `type`        | String enum, required       | `created`\|`stage_change`\|`owner_change`\|`note` |
| `oldStage` / `newStage` | String, nullable  | populated for `stage_change` |
| `reason`      | String, nullable            | required by application logic (not the DB) when the change is a backward stage move |
| `oldOwner` / `newOwner` | ObjectId → User, nullable | populated for `owner_change` |
| `note`        | String, nullable            | free-text note entries |
| `performedBy` | ObjectId → User, required   | |
| `createdAt`   | Date                        | the timeline order comes from this |

Rows are never updated or deleted after insert — there is no PUT/PATCH/DELETE route for this
collection at all, which is the actual enforcement mechanism (see schema-vs-application note
below).

## DealAlert

| Field         | Type                | Notes |
|---------------|---------------------|-------|
| `deal`        | ObjectId → Deal, required | |
| `owner`       | ObjectId → User, required | denormalized copy of `deal.owner` at alert-creation time (see below) |
| `closeDate`   | Date, required      | the `expectedCloseDate` the deal had *when this alert was raised* |
| `dismissed`   | Boolean, default false | |
| `dismissedAt` | Date, nullable      | |

## Relationships

- User → Company: one-to-many (`Company.owner`).
- User → Deal (owner): one-to-many.
- User ↔ Deal (collaborators): many-to-many, modeled as an array of ObjectIds on `Deal` rather
  than a join collection — see denormalization note.
- Company → Deal: one-to-many (`Deal.company`).
- Deal → DealHistory: one-to-many, append-only.
- Deal → DealAlert: one-to-many in theory, but the application enforces at most one *active*
  (non-dismissed) alert per deal per `closeDate` value (see `dealAlertController.syncDealAlerts`)
  — that invariant lives in application code, not a DB constraint.

## Database constraints vs. application constraints

Mongoose/MongoDB enforce: required fields, the enum sets on `role`/`stage`/`previousStage`/
`DealHistory.type`, and uniqueness on `User.email`. That's it — MongoDB has no foreign keys, so
every `ObjectId` reference (`Deal.company`, `Deal.owner`, `Company.owner`, everything on
`DealHistory`) is trusted, not verified by the database. If a referenced document is deleted,
nothing stops the reference from dangling.

Everything else lives in application code, because it's either cross-document (a single
collection's schema can't express it) or genuinely business logic rather than data shape:

- The stage state machine itself (forward-one, backward-one-with-reason, closed-lock, reopen).
- Visibility (a rep only sees deals/companies they own or collaborate on) — this is a query
  filter applied in every controller, not a database-level row-security rule, because MongoDB
  has no equivalent to Postgres RLS.
- "Only the owner or a manager can add/remove a collaborator" and the equivalent ownership
  checks — permission logic, not shape.
- The one-active-alert-per-close-date invariant on `DealAlert`.
- "A company must exist and not be archived before a deal can be created against it" — checked
  in `createDeal`, not enforced by a DB constraint.

## What was deliberately denormalized

- **`DealAlert.owner`** duplicates `Deal.owner` at the moment the alert is (re)created, instead
  of always joining through `Deal` to find the current owner. This matters specifically because
  dismissal is owner-scoped ("the deal's owner can dismiss the alert") — if a manager reassigns
  the deal *after* an alert was raised, the original owner keeps the ability to dismiss the
  alert they were actually shown, rather than the dismiss check silently pointing at whoever
  owns the deal *now*. The trade-off: if a deal is reassigned, the new owner won't be able to
  dismiss an alert raised before the reassignment until the next sync cycle recreates it under
  their name (which only happens once the old alert is cleaned up as stale).
- **`previousStage`** on `Deal` duplicates information that's technically recoverable from
  `DealHistory` (the stage immediately before the most recent `stage_change` to Won/Lost).
  Storing it directly avoids a history-timeline query and stage-diffing logic just to answer
  "what do I reopen this to," at the cost of one more field to keep in sync (only ever written
  in the one place a deal closes).

## What would break first at 100x the data

- **`getDeals` search-by-company-name** (`dealController.getDeals`) currently does two round
  trips: a `Company.find({ name: regex })` to collect matching IDs, then a `Deal.find` with
  those IDs in an `$in`. At 100x companies, the first query's regex scan (no text index) becomes
  the bottleneck before the deal query does — this needs a text index on `Company.name` (or a
  proper `$text` search) rather than a `$regex` scan.
- **`dealAlertController.syncDealAlerts`** loops over every currently-overdue deal and every
  currently-active alert on *every* `GET /api/deal-alerts` call, each iteration doing its own
  `findOne`/`create`/`deleteOne`. At 100x deals this turns one page load into potentially
  thousands of sequential queries. It should batch (single aggregation to find deals needing new
  alerts, a single `bulkWrite` to create/delete) instead of per-document round trips.
- **`dashboardController.getDashboard`**'s "won per week" loop runs 8 separate
  `countDocuments` queries per request. At 100x deal volume the counts themselves stay fast
  (indexed), but this is still 8x the round-trip latency of a single aggregation with
  `$bucket`/`$group` — worth collapsing into one query before deal volume grows.
- **No indexes are defined beyond the implicit `_id` and the unique `email`.** `Deal.owner`,
  `Deal.company`, `Deal.stage`, and `DealAlert.dismissed` are all filtered on in nearly every
  query in this app; at 100x rows these need explicit indexes or every list/dashboard/export
  endpoint degrades to a collection scan.
