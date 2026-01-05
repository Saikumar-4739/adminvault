# Production-ready Multi-stage Dockerfile for AdminVault
# Stage 1: Build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies (including dev deps for build)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build all applications (backend and frontend)
# Using the workspace script
RUN yarn build:all

# Stage 2: Production Runner
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy built assets and necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose ports
# Default Next.js port
EXPOSE 3000
# Backend port
EXPOSE 3001

# Start the application
# We use a custom start command or simplified entrypoint
# This assumes the backend is the primary service being containerized
# or we use a process manager like pm2 if running both.
CMD ["node", "dist/packages/backend/main.js"]
