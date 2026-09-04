# Plan

Answer each of these, in your own words.

- How did you break the work into sessions?
- What order did you build in, and why that order?
- What did you estimate versus what it actually took?
- What did you cut when you ran short?


## Day 1

- Started by understanding the existing project structure and the provided requirements.
- Set up the backend with MongoDB connection and the required environment variables.
- Implemented user authentication using JWT.
- Added role-based authentication for sales managers and sales representatives.
- Tested the authentication flow using Postman and verified protected API access.
- Estimated that the initial backend setup and authentication would take most of the first session, which was  close to the actual time.
- Did not cut any major functionality on Day 1; focused on getting the backend foundation working before moving to the CRM features.

## Day 2

- Continued with the core CRM functionality, starting with companies and then moving to deals.
- Implemented deal creation, listing, search, stage filtering, pagination, and updating deals.
- Added deal stage transitions with validation for backward transitions.
- Added deal history to keep track of stage changes.
- Implemented collaborator management for deals.
- Added deal alerts with APIs for generating, viewing, and dismissing alerts.
- The deal-related functionality took most of the session, with some additional time spent fixing and verifying API behaviour.
- Testing of the completed functionality was kept for the end of the implementation work rather than interrupting the development flow.

## Day 3

- Continued with the deal management and authorization requirements.
- Added rules for deal stage transitions, including restricting forward and backward movement to one stage at a time and requiring a reason when moving a deal backward.
- Implemented reopening of closed deals for sales managers and added deal owner reassignment with the corresponding history information.
- Added deal deletion with permission checks for the deal owner and sales managers.
- Implemented visibility rules so sales managers can view all relevant companies and deals, while sales representatives are restricted to the companies and deals they are allowed to see.
- Added bulk deal actions for sales managers, including bulk reassignment and bulk advancement, with individual success or rejection results for each selected deal.
- Implemented pipeline CSV export containing open deals, their company, stage, value, and stage-weighted value.
- Day 3 took longer than initially expected because several features required additional permission checks and interaction with the existing deal lifecycle.
- Did not cut any major functionality; testing and final verification were kept for the end of the implementation work.

### Day 4 — Frontend Development

- Set up React frontend with Vite.
- Implemented login and JWT-based authentication handling.
- Added protected routes for authenticated users.
- Added navigation and logout functionality.
- Connected frontend with backend APIs.
- Implemented Dashboard UI with CRM summary data.
- Implemented Companies UI with:
  - Company creation
  - Company search
  - Company editing
  - Archive and restore
  - Active/archived views
- Implemented Deals UI with:
  - Deal creation
  - Deal listing
  - Search and stage filtering
  - Deal editing and deletion
  - Stage transitions
  - Deal history
  - Collaborator management
  - Deal alerts
  - CSV export
  - Deal reopening
  - Bulk reassignment
  - Bulk stage advancement
- Added role-based frontend controls for manager-specific actions.
- Added server-side sorting and pagination controls to the Deals page.
- Added deal owner and company filters to the Deals page.
- Added deal notes functionality and displayed notes in the deal history.
- Added overdue alert count to the navigation.
- Redesigned the frontend using Material UI to provide a cleaner and more consistent CRM interface.
- Removed the default Vite branding and updated the application title to "Sales CRM".
- The frontend work took longer than initially expected because the UI had to be integrated with the completed backend APIs and several interactions had to be adjusted during verification.

## Final Verification

- Verified manager login and sales representative login.
- Verified company creation, editing, archiving, and restoring.
- Verified deal creation, editing, deletion, and stage transitions.
- Verified closed deal protection and manager reopening.
- Verified deal reassignment and collaborator management.
- Verified deal notes and immutable history.
- Verified overdue alerts and alert dismissal.
- Verified CSV export.
- Verified bulk stage advancement and bulk reassignment.
- Verified the dashboard and its main CRM metrics.
- Verified the frontend pages after the UI redesign.

## What I Estimated vs What Actually Took

The initial estimate was to complete the backend foundation and core CRM functionality first, followed by the frontend and final verification.

The backend implementation took approximately the planned sessions, but some features required additional time because of their interactions with authorization and deal lifecycle rules.

The frontend and final integration took longer than initially expected because multiple backend features had to be connected to the UI and verified together.

The final stage of the work was focused on integration, bug fixing, verification, UI improvements, and documentation rather than adding unnecessary features.

## What I Cut When I Ran Short

I prioritized the required assignment functionality and did not add optional features that were outside the core requirements.

Features not built included:

- Real-time WebSocket updates
- Email/SMS notifications
- Mobile application
- Advanced analytics beyond the required dashboard
- External CRM integrations

This allowed the available time to be focused on completing and verifying the required CRM functionality.
