#!/bin/bash
set -e

echo "🚀 Deploying adminvault..."

# Always move to this script's directory
cd "$(dirname "$0")"

echo "📥 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
npm install --no-optional --no-fund --no-audit

echo "🏗️ Building shared libraries..."
npm run build:shared

echo "🏗️ Building backend..."
npx nx build backend

echo "🏗️ Building frontend..."
npx nx build frontend

echo "🔁 Restarting backend..."
pm2 restart adminvault-backend || \
pm2 start dist/packages/backend/main.js --name adminvault-backend

echo "🔁 Restarting frontend..."
pm2 restart adminvault-frontend || \
pm2 start npm --name adminvault-frontend --cwd packages/frontend -- run serve

pm2 save

echo "✅ Deployment complete!"
