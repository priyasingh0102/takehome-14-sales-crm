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