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
npm run dev:backend
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