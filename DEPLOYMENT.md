# AdminVault - Deployment Guide

## 🚀 Deploying to Render

### Backend Deployment

#### Prerequisites
- GitHub repository connected to Render
- MySQL database configured on Render

#### Configuration Files

**`.npmrc`** (handles peer dependency conflicts):
```
legacy-peer-deps=true
```

**`render.yaml`** (deployment configuration):
```yaml
services:
  - type: web
    name: adminvault-backend
    runtime: node
    buildCommand: npm install && npx tsc --build packages/libs/shared-models/tsconfig.lib.json && npx tsc --build packages/libs/backend-utils/tsconfig.lib.json && npx nx build backend --configuration=production
    startCommand: node dist/backend/main.js
    envVars:
      - key: NODE_VERSION
        value: 22.16.0
      - key: NODE_ENV
        value: production
```

#### Environment Variables

Set these in Render Dashboard:

```
DATABASE_HOST=<your-mysql-host>
DATABASE_PORT=3306
DATABASE_USER=<your-db-user>
DATABASE_PASSWORD=<your-db-password>
DATABASE_NAME=adminvault
JWT_SECRET=<your-secret-key>
PORT=3000
NODE_ENV=production
```

#### Deployment Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Render will automatically:**
   - Detect the `render.yaml` file
   - Run `npm install` with `--legacy-peer-deps` (from `.npmrc`)
   - Build the backend: `npx nx build backend --configuration=production`
   - Start the server: `node dist/backend/main.js`

3. **Access your API:**
   - Your backend will be available at: `https://adminvault-backend.onrender.com`

---

## 🌐 Frontend Deployment (Optional)

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd packages/frontend
   vercel
   ```

3. **Set Environment Variables in Vercel:**
   ```
   NEXT_PUBLIC_API_URL=https://adminvault-backend.onrender.com
   ```

### Deploy to Render (Static Site)

**Add to `render.yaml`:**
```yaml
  - type: web
    name: adminvault-frontend
    runtime: node
    buildCommand: cd packages/frontend && npm install && npx next build
    startCommand: cd packages/frontend && npx next start
    envVars:
      - key: NODE_VERSION
        value: 22.16.0
      - key: NEXT_PUBLIC_API_URL
        value: https://adminvault-backend.onrender.com
```

---

## 🔧 Troubleshooting

### Build Fails with Peer Dependency Errors

**Solution:** The `.npmrc` file with `legacy-peer-deps=true` should handle this automatically.

If it still fails, update the build command in Render Dashboard:
```bash
npm install --legacy-peer-deps && npx nx build backend --configuration=production
```

### Database Connection Errors

**Check:**
1. Database host and credentials are correct
2. Database is accessible from Render's IP
3. MySQL database is running
4. Environment variables are set correctly

### Build Succeeds but Server Won't Start

**Check:**
1. `dist/backend/main.js` exists after build
2. All dependencies are in `dependencies` (not `devDependencies`)
3. Port is set correctly (Render uses `PORT` env variable)

---

## 📝 Build Command Explanation

```bash
npm install && npx tsc --build packages/libs/shared-models/tsconfig.lib.json && npx tsc --build packages/libs/backend-utils/tsconfig.lib.json && npx nx build backend --configuration=production
```

- `npm install` - Installs all dependencies (uses `.npmrc` for legacy-peer-deps)
- `npx tsc --build packages/libs/shared-models/tsconfig.lib.json` - Builds shared-models library
- `npx tsc --build packages/libs/backend-utils/tsconfig.lib.json` - Builds backend-utils library
- `npx nx build backend --configuration=production` - Builds the backend using Nx
- `--configuration=production` - Uses production configuration

**Why build shared libraries first?** The backend depends on `@adminvault/shared-models` and `@adminvault/backend-utils`. These must be compiled before Webpack can bundle the backend.

---

## ✅ Verification

After deployment:

1. **Check build logs** in Render Dashboard
2. **Test API endpoint:**
   ```bash
   curl https://adminvault-backend.onrender.com/api/health
   ```
3. **Test from frontend:**
   - Update `APP_AVS_SERVICE_URL` in frontend to point to Render URL
   - Test login and API calls

---

## 🎯 Quick Fix for Current Deployment

Since your deployment is already failing, here's what to do:

1. **Commit the new files:**
   ```bash
   git add .npmrc render.yaml
   git commit -m "Fix deployment peer dependency issues"
   git push origin main
   ```

2. **Render will automatically redeploy** and should succeed this time!

---

## 📞 Support

If deployment still fails:
1. Check Render build logs
2. Verify all environment variables are set
3. Ensure database is accessible
4. Check that `.npmrc` file is committed to repository
