# AI prompts

The prompts you actually used, in the order you used them, grouped by what you were trying to achieve. For each significant one: what you asked, what you got back, and what you had to correct.

Include at least one prompt that produced something wrong, and what you did about it.

If you did not use AI at all, say so here, and describe your process instead.

## <What you were trying to achieve>

### Prompt

### What you got

### What you corrected


I used AI assistance during the development of this project for planning, implementation guidance, debugging, documentation, and frontend improvements.

I reviewed and tested the generated suggestions before applying them to the project.

---

## 1. Understanding and Planning the Assignment

### Prompt

"Help me understand the Sales CRM assignment requirements and break the implementation into manageable development sessions."

### Purpose

Used this to understand the required functionality and organize the development work into backend, frontend, and verification sessions.

### Outcome

The work was divided into smaller sessions, with backend authentication and core CRM functionality implemented before the frontend.

---

## 2. Backend Authentication and Authorization

### Prompt

"Help me implement JWT authentication and role-based authorization for a Node.js, Express and MongoDB Sales CRM with sales manager and sales representative roles."

### Purpose

Used this while implementing authentication middleware and role-based permissions.

### Outcome

Implemented JWT-based authentication and server-side role checks for protected operations.

---

## 3. Deal Lifecycle Rules

### Prompt

"Help me implement the Sales CRM deal lifecycle where deals move from New to Qualified to Proposal to Negotiation and then Won or Lost. Forward movement should only be one stage at a time, backward movement should require a reason, and closed deals should not normally change."

### Purpose

Used to reason about the lifecycle rules and implement validation in the backend.

### Outcome

The lifecycle validation was implemented in the deal controller and tested through the application.

---

## 4. Collaborators and Deal Permissions

### Prompt

"Help me implement deal collaborators so that managers and deal owners can add or remove sales representatives, while owners and collaborators can update the deal."

### Purpose

Used while implementing collaborator APIs and permission checks.

### Outcome

Collaborator management and visibility were implemented on the server and connected to the frontend.

---

## 5. Server-Side Deal Search and Pagination

### Prompt

"Help me implement server-side deal search by title and company name, filtering by company, stage and owner, sorting by value, expected close date and last update, and pagination with total results."

### Purpose

Used to implement the deal listing requirements without filtering the entire dataset in the browser.

### Outcome

Search, filtering, sorting and pagination were implemented in the backend and then connected to the React Deals page.

---

## 6. Bulk Operations

### Prompt

"Help me implement manager-only bulk deal reassignment and bulk stage advancement, where every selected deal should return an individual success or rejection result."

### Purpose

Used to implement the bulk operations required by the assignment.

### Outcome

The backend processes each selected deal individually and returns per-deal results. The frontend displays the results to the manager.

---

## 7. Overdue Deal Alerts

### Prompt

"Help me implement overdue deal alerts where an open deal past its expected close date creates an alert for its owner, the owner can dismiss it, and the alert should be able to appear again if the expected close date changes and the deal becomes overdue again."

### Purpose

Used while implementing the DealAlert functionality.

### Outcome

The alert logic was implemented and verified using a sales representative account.

---

## 8. Frontend UI

### Prompt

"Help me improve the React frontend of my Sales CRM and make the Dashboard, Companies, Deals and Alerts pages look like a clean professional CRM interface."

### Purpose

Used to improve the frontend presentation after the main functionality was implemented.

### Outcome

Material UI was introduced and the application was redesigned with a consistent navigation and layout.

---

## 9. Debugging and Verification

### Prompt

"Help me debug this error and explain what is causing it instead of just giving me the final code."

### Purpose

Used when API, frontend integration, authentication, or UI issues occurred during development.

### Outcome

The suggestions were checked against the existing code and tested before changes were kept.

---

## 10. Incorrect AI Suggestion and Correction

### Prompt

"Help me fix the current frontend code and tell me exactly what line needs to be changed."

### What went wrong

During development, an AI suggestion recommended a change that was unnecessary because the existing code already contained the required logic.

### What I did

I checked the existing implementation before making the change and verified that the suggested replacement was effectively identical to the code already present.

I kept the existing implementation instead of making a redundant change.

### Lesson

AI suggestions were treated as recommendations rather than automatically accepted changes. I checked the existing code and verified the behaviour before applying changes.

---

## 11. Documentation Assistance

### Prompt

"Help me write the required Sales CRM documentation based on the functionality I actually implemented."

### Purpose

Used to organize the architecture, schema, plan, decisions and AI usage documentation.

### Outcome

The documentation was written around the actual project implementation rather than adding features that were not built.

---

## How AI Was Used

AI was mainly used as a development assistant for:

- Understanding requirements
- Breaking work into smaller tasks
- Implementation guidance
- Debugging
- Reviewing design choices
- Frontend UI improvements
- Documentation

I remained responsible for integrating the suggestions, checking the code, running the application, and verifying the resulting behaviour.

AI-generated suggestions were not treated as a replacement for understanding the implementation.