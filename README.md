# AdminVault

## 🚀 Quick Start

### Prerequisites
- Node.js (v20+)
- MySQL
- Git

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment
Create a `.env` file in `packages/backend/`:
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=adminvault

# Auth
JWT_SECRET=development_secret_key

# App
PORT=3001
NODE_ENV=development
```

### 3. Run Application
Start both Backend and Frontend concurrently:
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Swagger API: `http://localhost:3001/docs`

---

## 🛠 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts both Frontend and Backend |
| `npm run dev:frontend` | Starts only Frontend |
| `npm run dev:backend` | Builds shared libs & Starts Backend |
| `npm run build:all` | Builds everything (Shared, Backend, Frontend) |
| `npm run clean` | Cleans node_modules and build artifacts |