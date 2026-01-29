# AdminVault Deployment Guide

## Prerequisites
- **Docker** and **Docker Compose** installed on the target machine.
- Access to the codebase (git clone).
- A valid `.env` file in the root directory (see `.env.example`).

## Environment Configuration
Ensure your `.env` file is populated with production values:

```env
# Database
DB_HOST=db
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_secure_password
DB_DATABASE=adminvault

# Backend
PORT=3333
JWT_SECRET_KEY=your_secure_jwt_secret
JWT_REFRESH_SECRET_KEY=your_secure_refresh_secret
FRONTEND_URL=http://localhost:4200

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3333/api
```

> **Note**: In `docker-compose.yml`, the backend expects the database host to be `db` (the service name).

## Deploying with Docker Compose

1. **Navigate to the deployment directory**:
   ```bash
   cd documents/deployment
   ```

2. **Build and Start Services**:
   ```bash
   docker compose up -d --build
   ```

3. **Verify Deployment**:
   - Backend: `http://localhost:3333/api` (Swagger docs at `/docs`)
   - Frontend: `http://localhost:4200`

## Troubleshooting
- **Database Connection**: If the backend fails to connect, check the logs: `docker compose logs -f backend`. Ensure `DB_HOST` is set to `db` in the docker-compose context.
- **Rebuild**: If you make code changes, run `docker compose up -d --build` to force a rebuild of the images.
