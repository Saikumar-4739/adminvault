#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Load Node memory safety
export NODE_OPTIONS="--max-old-space-size=1024"

echo "📥 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building shared libs..."
npm run build:shared

echo "🔨 Building backend..."
npx nx build backend

echo "🧹 Cleaning up old build artifacts..."
rm -rf packages/frontend/out
rm -rf dist

echo "🔨 Building frontend..."
npx nx build frontend

echo "♻️ Restarting backend..."
pm2 restart adminvault-backend

echo "♻️ Restarting frontend..."
pm2 restart adminvault-frontend

echo "💾 Saving PM2 state..."
pm2 save

echo "✅ Deployment completed successfully!"
