#!/bin/bash
set -e

echo "🎨 UI-only deployment started..."

export NODE_OPTIONS="--max-old-space-size=1024"

echo "📥 Pulling latest code..."
git reset --hard origin/main

echo "📦 Installing dependencies (if needed)..."
npm install

echo "🔨 Building FRONTEND only..."
npx nx build frontend

echo "♻️ Restarting frontend..."
pm2 restart adminvault-frontend

pm2 save
echo "✅ UI deployment completed successfully!"
