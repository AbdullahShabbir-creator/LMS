# LMS System

This is a fully functional Learning Management System (LMS) with student, instructor, and admin roles.

## System Requirements

- Node.js (v14+)
- MongoDB (local installation recommended)

## Quick Start

1. Run the setup script to start both frontend and backend:

```bash
node run-lms.js
```

2. The script will:
   - Create a .env file if it doesn't exist
   - Check MongoDB connection
   - Install dependencies if needed
   - Start both frontend and backend servers

3. Visit the application at:
   - Frontend: http://localhost:3000/
   - Backend API: http://localhost:5000/

## Manual Setup

If you prefer to set up manually:

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Create a `.env` file with the following content:
```
MONGO_URI=mongodb://127.0.0.1:27017/lms
PORT=5000
NODE_ENV=development
SKIP_AUTH=true
JWT_SECRET=supersecretkey
```

3. Install dependencies and start the server:
```bash
npm install
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies and start the frontend:
```bash
npm install
npm start
```

## Login Information

The system has fallback authentication with the following credentials:

| Role       | Email                   | Password  |
|------------|-------------------------|-----------|
| Student    | student@example.com     | password  |
| Instructor | instructor@example.com  | password  |
| Admin      | admin@example.com       | password  |

## Features

- **Student Features**: Course enrollment, smart quiz, progress tracking, notifications
- **Instructor Features**: Course management, student management, analytics, lectures
- **Admin Features**: User management, course approvals, category management, payments

## Troubleshooting

1. **MongoDB Connection Issues**:
   - Ensure MongoDB is installed and running on your machine
   - The system will use fallback authentication if the database isn't available

2. **API Connection Issues**:
   - Backend should be running on port 5000
   - Check API status at http://localhost:5000/api/status

3. **Authentication Issues**:
   - The system has fallback authentication for development
   - In case of issues, try the default credentials listed above 