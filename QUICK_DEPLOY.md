# 🚀 Quick Deployment Reference

## Local Development Setup

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your local values
npm install
node server.js

# Frontend (new terminal)
cd frontend
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:3000
npm install
npm run dev
```

## Production Deployment (Render Example)

### 1. Backend on Render

**Repository:** Your GitHub repo  
**Root Directory:** `backend`  
**Build Command:** `npm install`  
**Start Command:** `node server.js`

**Environment Variables:**

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLIENT_URL=https://your-frontend.onrender.com
FIREBASE_STORAGE_BUCKET=your-bucket.firebasestorage.app
NODE_ENV=production
PORT=3000
```

### 2. Frontend on Render

**Repository:** Same GitHub repo  
**Root Directory:** `frontend`  
**Build Command:** `npm install && npm run build`  
**Publish Directory:** `dist`

**Environment Variables:**

```
VITE_API_URL=https://your-backend.onrender.com
```

## Critical Environment Variables

| Variable       | Where    | Example                    | Description               |
| -------------- | -------- | -------------------------- | ------------------------- |
| `VITE_API_URL` | Frontend | `https://api.gorahrib.com` | Your backend API URL      |
| `CLIENT_URL`   | Backend  | `https://gorahrib.com`     | Your frontend URL         |
| `MONGODB_URI`  | Backend  | `mongodb+srv://...`        | MongoDB connection string |
| `JWT_SECRET`   | Backend  | `abc123xyz...`             | Random secret key         |
| `NODE_ENV`     | Backend  | `production`               | Environment mode          |

## Common Issues

❌ **CORS Error:** `CLIENT_URL` doesn't match frontend URL  
❌ **API 404:** `VITE_API_URL` is wrong or backend is down  
❌ **Auth failing:** `JWT_SECRET` changed or missing  
❌ **Emails not sending:** Wrong `EMAIL_PASS` or not using app password

## Testing Checklist

- [ ] Can register new account
- [ ] Receive verification email
- [ ] Can login
- [ ] Can upload profile picture
- [ ] Can add peaks to checklist
- [ ] Can create forum posts
- [ ] Leaderboard loads

## File Structure After Changes

```
GoraHrib_MERN/
├── DEPLOYMENT.md          ← Full deployment guide
├── DEPLOYMENT_CHANGES.md  ← What was changed
├── QUICK_DEPLOY.md        ← This file
├── frontend/
│   ├── .env               ← Your local config (not in git)
│   ├── .env.example       ← Template for deployment
│   └── src/
│       └── config/
│           └── axios.js   ← Centralized API config
└── backend/
    ├── .env               ← Your local config (not in git)
    ├── .env.example       ← Template for deployment
    └── server.js          ← Updated CORS config
```

## Resources

- Full guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Changes made: [DEPLOYMENT_CHANGES.md](DEPLOYMENT_CHANGES.md)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
