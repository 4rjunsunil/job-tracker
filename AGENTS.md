# Job Search Tracker Project Instructions

## Project overview
This project is a job application tracking app with a React frontend and a planned Node.js + Express backend using MongoDB and JWT authentication.

## Repository structure
- `ui/`: React + TypeScript frontend app
- `server/`: reserved for the future backend API and MongoDB integration
- root: project-level docs and workspace configuration

## Current app direction
- The app name is: Job Search Tracker
- The UI should remain branded as Job Search Tracker, not Daymark or any previous placeholder name
- The dashboard should track job applications, statuses, and summary metrics
- Current frontend persistence is browser localStorage until the backend is connected
- Authentication direction is JWT-based auth rather than Firebase

## Status values
Use these application statuses consistently:
- Applied
- Interview
- Offer
- Rejected

## Frontend rules
- Keep the main dashboard logic and styling inside `ui/`
- Do not rename the product from Job Search Tracker
- Keep the layout focused on job tracking, analytics, and application management
- Do not reintroduce removed sidebar items like Weekly Focus unless explicitly requested
- Preserve responsive behavior and avoid layout overflow issues on mobile

## Backend plan
When the backend is added:
- create a separate `server/` folder
- use Express.js
- use MongoDB for persistence
- protect routes with JWT middleware
- keep user-specific records scoped to authenticated users
- add register/login endpoints and secure CRUD operations for applications

## Validation
Before claiming work is complete:
- run the relevant frontend build or test command
- confirm the app still builds successfully
- keep the project in a working state

## Implementation notes
- Use Vite 4 in the frontend for compatibility with Node 16 in the current environment
- Prefer a clean separation between frontend and backend work
- Keep code understandable and maintainable as the project grows
