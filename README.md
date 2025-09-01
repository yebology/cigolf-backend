# CIGOLF BACKEND

A backend application for the CIGOLF project.

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Database (as configured in your environment)

## Getting Started

Follow these steps to set up and run the project locally:

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure your settings:
```bash
cp .env.example .env
```
**Important:** Edit the `.env` file with your actual database credentials and other configuration values.

### 3. Database Setup
Generate Prisma client and set up the database schema:
```bash
npx prisma generate
npx prisma db push
```

### 4. Start Development Server
```bash
npm run dev
```

The application should now be running on your configured port (typically `http://localhost:3000`).

## Test Users

For testing purposes, you can use these pre-configured user accounts:

### SPV User
- **Username:** `Brigitte.Rohan`
- **Password:** `password123`

### Foreman User
- **Username:** `Joanne60`
- **Password:** `password123`

### Admin User
- **Username:** `Trent67`
- **Password:** `password123`

## Troubleshooting

- Ensure your database is running and accessible
- Check that all environment variables are properly set in your `.env` file
- Run `npm install` again if you encounter dependency issues