# Decisions

Log the decisions that actually shaped this codebase — the ones where a real alternative existed and
you picked one. At least five entries. For each: what you chose, what you rejected, and why. At least
one entry must be a decision you later reversed — say what changed your mind. It can be any entry
below, not necessarily the last one; add a **Later reversed:** line to whichever one it is.

## Decision 1

- **Chose:** JWT-based authentication with middleware to identify the logged-in user.
- **Rejected:** Passing user identity manually with every request.
- **Why:** JWT keeps authentication centralized and allows protected routes to obtain the current user through middleware.

## Decision 2

- **Chose:** Enforce role-based permissions in backend controller logic.
- **Rejected:** Relying only on frontend restrictions.
- **Why:** Authorization must be enforced on the server so that restricted actions cannot be bypassed by directly calling the API.

## Decision 3

- **Chose:** Store `previousStage` on the Deal document.
- **Rejected:** Determining the previous stage only from the history timeline.
- **Why:** Keeping the previous stage directly on the deal makes reopening a closed deal straightforward and allows it to return to the stage it occupied before being closed.

## Decision 4

- **Chose:** Process bulk actions deal-by-deal and return an individual result for each deal.
- **Rejected:** Failing the entire bulk operation when one deal is invalid.
- **Why:** The requirement specifically expects successful and rejected deals to be reported separately, including the reason for rejection.

## Decision 5

- **Chose:** Calculate stage-weighted pipeline value using a fixed stage-weight mapping in the application.
- **Rejected:** Storing a separate probability value on every deal.
- **Why:** The assignment requires stage-weighted value but does not provide specific probability percentages. A single mapping keeps the calculation consistent across the CSV export and dashboard.

## Decision 6

- **Chose:** Restrict Sales Rep company visibility to companies they own.
- **Rejected:** Including collaborators in company visibility.
- **Why:** The Company schema contains an owner relationship but does not contain a collaborators field, so visibility must follow the actual data model.

- **Later reversed:** An initial implementation attempted to include collaborators when filtering companies. After checking the Company schema, this was changed to owner-only visibility.