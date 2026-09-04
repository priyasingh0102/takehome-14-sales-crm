# Submission

Fill this in and commit it. This is the first file we open.

## Links

- **GitHub repository:** https://github.com/priyasingh0102/takehome-14-sales-crm
- **Live application:**  https://takehome-14-sales-crm.vercel.app/
## Notes for the reviewer

<Anything we should know before opening the link — e.g. your host sleeps when idle and the first
request can take up to a minute.>

The application includes seeded demo data and demo credentials for reviewing the main CRM workflows.

The backend uses environment variables for sensitive configuration such as the MongoDB connection string and JWT secret.

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Sales Manager | manager@demo.com| Password123! |
| Sales Representative | alex@demo.com| Password123! |
| Sales Representative | bailey@demo.com | Password123! |


## Stack

| Layer | What you used | Why |
|-------|---------------|-----|
| Frontend | React, Vite, Material UI | Component-based frontend with a clean CRM interface  |
| Backend | Node.js, Express.js, Mongoose, JWT  | REST APIs, business logic, authentication and authorization |
| Database | MongoDB Atlas | Persistent storage for users, companies, deals, history and alerts |
| Hosting | | |

## Goal checklist

Mark each honestly. Partial is fine — say what is partial.

| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | Accounts and roles| Done | Sales Manager and Sales Representative roles with server-enforced permissions |
| 2 | Companies| Done | Create, edit, archive and restore companies |
| 3 | Deals | Done | Create, edit and delete deals with company, value, close date and owner |
| 4 | Deal lifecycle | Done | Stage transitions, validation, Won/Lost handling and manager reopen |
| 5 | Collaborators | Done | Add/remove collaborators and collaborator-based deal access |
| 6 | Deal list and bulk actions | Done | Server-side search, filters, sorting, pagination, bulk advance and reassignment |
| 7 | CSV export | Done | Export of open deals with stage-weighted values |
| 8 | Dashboard | Done | Pipeline, won/lost metrics, stage/owner breakdown and weekly won metrics |
| 9 | Immutable history | Done | Deal creation, stage changes, owner changes and notes are recorded |
| 10 | Past-due alerts | Done | Overdue open-deal alerts with owner dismissal and alert reappearance logic |

## How much time did you actually spend?

Approximately 7 days of development work, including backend implementation, frontend development, integration, debugging, documentation and verification.

## What would you do next, with another 12 hours?

With another 12 hours, I would focus on:

- Adding more automated backend/API tests for edge cases.
- Improving frontend validation and error handling.
- Adding more detailed dashboard analytics.
- Improving the overall responsive/mobile experience.
- Performing another end-to-end review of all role-based workflows.

## What are you least happy with in this codebase, and why?

The area I am least happy with is the amount of automated test coverage. Most major workflows were manually verified through the application and API, but with more time I would add a more comprehensive automated test suite covering permissions, lifecycle edge cases, bulk operations and alerts.