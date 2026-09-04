# Architecture

Answer each of these, in your own words, once the system has taken real shape.

## What are the moving pieces, and how do they talk to each other?

The application is a full-stack Sales CRM built using the MERN stack.

The main moving pieces are:

- **React + Vite frontend** — provides the user interface for login, dashboard, companies, deals, and alerts.
- **Material UI** — used for the frontend layout and UI components.
- **Node.js + Express backend** — exposes REST APIs and contains the application/business logic.
- **MongoDB Atlas** — stores users, companies, deals, deal history, and deal alerts.
- **Mongoose** — handles MongoDB schemas and database queries.
- **JWT authentication** — authenticates users and allows the backend to identify the logged-in user and their role.

The frontend communicates with the backend through HTTP REST APIs using JSON.

The frontend sends the JWT with protected requests. The backend authentication middleware validates the token, and role/permission checks are performed on the server before protected operations are executed.

The main API areas are:

- `/api/users`
- `/api/companies`
- `/api/deals`
- `/api/deal-alerts`

The backend is responsible for enforcing business rules such as deal stage transitions, role permissions, deal visibility, collaboration permissions, reassignment, and reopening closed deals.

---

## Where does each piece run?

During development:

- The **React/Vite frontend** runs locally on the development server.
- The **Node.js/Express backend** runs locally on the backend server.
- **MongoDB Atlas** is used as the remote database.
- The frontend connects to the backend using the `VITE_API_URL` environment variable.

The application is structured so that the frontend does not directly access MongoDB. All database operations go through the Express backend.

Environment variables are used for configuration such as:

- `VITE_API_URL`
- `MONGO_URI`
- `JWT_SECRET`

Secrets are not stored directly in the source code.

---

## What is the request path for one representative user action, end to end?

### Example: Updating a deal's stage

1. The user logs into the React application.
2. The backend authenticates the user and returns a JWT.
3. The frontend stores the authentication information and uses the token for protected requests.
4. On the Deals page, the user selects a new stage for a deal.
5. The React frontend sends a request to the deal stage API with the selected stage and authentication token.
6. Express receives the request.
7. Authentication middleware verifies the JWT and identifies the user and their role.
8. The deal controller checks whether the user is allowed to update that deal.
9. The controller validates the lifecycle rule:
   - forward movement can only advance one stage;
   - backward movement can only go back one stage and requires a reason;
   - closed Won/Lost deals cannot be changed normally.
10. If the transition is valid, Mongoose updates the Deal document in MongoDB.
11. A corresponding DealHistory entry is created containing the old stage, new stage, reason where applicable, and the user who performed the action.
12. The backend returns the updated deal/result to the frontend.
13. React updates the Deals page so the user sees the new stage.

This keeps important business rules on the server instead of relying only on frontend restrictions.

---

## What did you decide *not* to build, and why?

I focused on the requirements that were explicitly part of the Sales CRM assignment and avoided adding features that were not necessary for the core workflow.

I did not build:

- **Real-time WebSocket updates** — the CRM does not require multiple users to see changes instantly. Normal REST requests are sufficient for the current scope.
- **Advanced notification channels such as email/SMS** — the requirement only needs in-app overdue deal alerts.
- **A separate mobile application** — the assignment requires a browser-based CRM, so the work was focused on the web application.
- **Complex reporting/analytics beyond the required dashboard** — the dashboard implements the specified pipeline and won/lost metrics without adding unnecessary reporting features.
- **External third-party CRM integrations** — they were outside the assignment scope.

The goal was to keep the implementation focused on the required CRM functionality while keeping the architecture simple enough to understand and maintain.
