# Job Search Tracker

A job application tracking dashboard built with React + TypeScript on the frontend and Node.js + Express on the backend. The app helps users save job applications, track progress across statuses, monitor interview dates, and review summary metrics.

## Tech Stack

- Frontend: React, TypeScript, Vite, Chart.js, Lucide icons
- Backend: Node.js, Express.js, MongoDB, JWT auth
- Authentication: JWT-based authentication with bcrypt password hashing

## Features

- Sign up and sign in flow
- Secure JWT-based authentication
- Add, edit, delete, and filter job applications
- Update application status: Applied, Interview, Offer, Rejected
- Dashboard summary cards for totals, in-progress jobs, offers, and response rate
- Interview timeline and application pipeline analytics
- Responsive dashboard UI for desktop and smaller screens

## Project Structure

- `ui/`: frontend application
- `server/`: backend API and MongoDB models/routes
- `AGENTS.md`: project-specific development instructions

## Local Development Setup

### 1) Install dependencies

Frontend:

```bash
cd ui
npm install
```

Backend:

```bash
cd server
npm install
```

### 2) Configure environment variables

Create a `.env` file in the `server/` folder with:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job-search-tracker
JWT_SECRET=your-secret-key
```

### 3) Start MongoDB

Use your local MongoDB instance or a Dockerized MongoDB container.

### 4) Run the app

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd ui
npm run dev
```

The frontend will typically run on port 5173, and the API will run on port 5000.

## Build Verification

The frontend build was verified successfully with:

```bash
cd ui
npm run build
```

This currently succeeds with Vite production builds.

## Notes

- The app is complete for local development and feature work.
- Production deployment is not yet configured in this repo.
- For production, the recommended setup is:
  - Render for the backend
  - Vercel for the frontend
  - MongoDB Atlas for the database

## Future Deployment Plan

1. Deploy backend to Render
2. Set `MONGODB_URI` to the MongoDB Atlas connection string
3. Set `JWT_SECRET` in Render environment variables
4. Deploy frontend to Vercel and set `VITE_API_URL` to the live backend URL
5. Run smoke tests against the live environment

## License

This project is intended for personal portfolio / learning use unless otherwise specified.
