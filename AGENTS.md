# Job Search Tracker Project Instructions

## Project overview
This project is a full-stack job application tracking app built with a React + TypeScript frontend and a Node.js + Express backend using MongoDB and JWT authentication.

## Repository structure
- `ui/`: React + TypeScript frontend app
- `server/`: Express backend API with MongoDB models, routes, JWT auth, and middleware
- root: project-level docs and workspace configuration

## Current app direction
- The app name is: Job Search Tracker
- The UI must remain branded as Job Search Tracker, not Daymark or any previous placeholder name
- The dashboard tracks job applications, statuses, and summary metrics
- The frontend uses live API integration with the backend for auth and application data
- Authentication is JWT-based, not Firebase
- Applications are stored per authenticated user in MongoDB

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
- Preserve responsive behavior and avoid mobile layout overflow issues
- Use the backend API for auth and app data instead of relying only on browser localStorage

## Backend rules
- Keep the backend in `server/`
- Use Express.js
- Use MongoDB for persistence
- Protect application routes with JWT middleware
- Keep user-specific records scoped to the authenticated user
- Add register/login endpoints and secure CRUD operations for applications
- Hash passwords with bcrypt before storing them

## Deployment notes
- Frontend is deployed on Vercel
- Backend is deployed on Render
- Production database uses MongoDB Atlas
- Use environment variables for `PORT`, `MONGODB_URI`, and `JWT_SECRET`
- Set `VITE_API_URL` in the frontend environment to the live backend URL

## Validation
Before claiming work is complete:
- run the relevant frontend build or test command
- confirm the project still builds successfully
- verify the backend health route and auth flow still work
- keep the project in a working state

## Implementation notes
- Use Vite 4 in the frontend for compatibility with Node 16 in the current environment
- Prefer a clean separation between frontend and backend work
- Keep code understandable and maintainable as the project grows
- Use production-friendly configuration rather than local-only assumptions when deploying
