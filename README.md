# AdminVault

## Development
### Frontend
```bash
npx nx dev frontend
```
- Runs on: http://localhost:3000 

### Backend
```bash
npx nx serve backend --output-style=stream
```
- Runs on: http://localhost:3001/api



## Production
### Frontend
```bash
npx next build
```
- Runs on: https://adminvault-frontend.vercel.app

### Backend
```bash
node dist/backend/main.js
```
- Runs on: https://adminvault.onrender.com
