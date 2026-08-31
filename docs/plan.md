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