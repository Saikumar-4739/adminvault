# AdminVault - Quick Start Guide

## 🚀 Running the Application Locally

### Prerequisites
- Node.js 22.x
- MySQL database running
- Git

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=adminvault

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 3. Run the Backend

**Important:** The backend depends on shared libraries that must be built first.

```bash
npm run serve:backend
```

This command will:
1. Build `@adminvault/shared-models`
2. Build `@adminvault/backend-utils`
3. Start the backend server on `http://localhost:3001`

### 4. Run the Frontend

In a **new terminal**:

```bash
npm run dev:frontend
```

The frontend will start on `http://localhost:3000`

---

## 📝 Available Scripts

### Backend

```bash
# Build shared libraries only
npm run build:shared

# Build backend (includes building shared libraries)
npm run build:backend

# Run backend in development mode (includes building shared libraries)
npm run serve:backend
```

### Frontend

```bash
# Run frontend in development mode
npm run dev:frontend
```

---

## 🔧 Troubleshooting

### Backend: "Cannot find module '@adminvault/shared-models'"

**Solution:** Always use `npm run serve:backend` instead of `npx nx serve backend` directly. This ensures shared libraries are built first.

### Frontend: Tailwind CSS not working

**Solution:** Make sure you've run `npm install` and restart the dev server.

### Database Connection Errors

**Check:**
1. MySQL is running
2. Database credentials in `.env` are correct
3. Database `adminvault` exists

**Create database:**
```sql
CREATE DATABASE adminvault;
```

---

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Swagger Docs**: http://localhost:3001/api/docs

---

## 📦 Project Structure

```
AdminVault/
├── packages/
│   ├── backend/           # NestJS backend
│   ├── frontend/          # Next.js frontend
│   └── libs/
│       ├── shared-models/      # Shared TypeScript models
│       ├── shared-services/    # Frontend API services
│       └── backend-utils/      # Backend utilities
├── .npmrc                 # npm configuration (legacy-peer-deps)
├── package.json           # Root package with build scripts
└── render.yaml            # Render deployment configuration
```

---

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Render.

---
