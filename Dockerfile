# =======================
# 1️⃣ Builder Stage
# =======================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root files
COPY package*.json ./

# Copy package.json files for caching
COPY packages/shared/package*.json packages/shared/
COPY packages/backend/package*.json packages/backend/
COPY packages/frontend/package*.json packages/frontend/

# Install all dependencies
RUN npm install

# Copy full source
COPY . .

# Build all packages
RUN npm run build:shared \
 && npm run build:backend \
 && npm run build:frontend


# =======================
# 2️⃣ Backend Runtime
# =======================
FROM node:20-alpine AS backend

WORKDIR /app

COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/package*.json ./

RUN npm install --production

EXPOSE 3001
CMD ["node", "dist/main.js"]


# =======================
# 3️⃣ Frontend Runtime
# =======================
FROM node:20-alpine AS frontend

WORKDIR /app

COPY --from=builder /app/packages/frontend/.next ./.next
COPY --from=builder /app/packages/frontend/public ./public
COPY --from=builder /app/packages/frontend/package*.json ./

RUN npm install --production

EXPOSE 3000
CMD ["npm", "start"]
