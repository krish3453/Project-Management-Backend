# Project Management Backend

Node.js and Express backend for a project management system. It uses MongoDB for persistence, JWT-based authentication, cookies for session delivery, and validation middleware for request safety.

## Features

- User registration, login, logout, and token refresh
- Email verification and password reset flow
- Protected project APIs with role-based permissions
- Health check endpoint
- Static file hosting from the `public` folder

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT
- Cookie Parser
- CORS
- Multer
- Nodemailer

## Project Structure

- `src/index.js` - entry point
- `src/app.js` - Express app configuration
- `src/db/mongodb.js` - MongoDB connection
- `src/controllers/` - route handlers
- `src/routes/` - API routes
- `src/middlewares/` - auth, validation, and upload middleware
- `src/models/` - database models
- `src/validators/` - request validation rules
- `public/` - static assets

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root with the required variables:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
```

3. Start the server:

```bash
npm run dev
```

For production:

```bash
npm start
```

## Scripts

- `npm run dev` - start the app with Nodemon
- `npm start` - start the app with Node.js

## API Routes

Base path: `/api/v1`

### Health Check

- `GET /api/v1/healthcheck`

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/verifyemail/:verificationToken`
- `POST /api/v1/auth/refresh-token`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password/:resetToken`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/currentUser`
- `POST /api/v1/auth/changepass`
- `POST /api/v1/auth/resendemailveri`

### Projects

- `GET /api/v1/project`
- `POST /api/v1/project`
- `GET /api/v1/project/:projectId`
- `PUT /api/v1/project/:projectId`
- `DELETE /api/v1/project/:projectId`
- `GET /api/v1/project/:projectId/members`
- `POST /api/v1/project/:projectId/members`
- `PUT /api/v1/project/:projectId/members/:userId`
- `DELETE /api/v1/project/:projectId/members/:userId`

## Notes

- The server reads `MONGO_URI`, `PORT`, and `CORS_ORIGIN` from environment variables.
- Authentication uses cookies and JWT middleware.
- Project endpoints are protected and require authentication.