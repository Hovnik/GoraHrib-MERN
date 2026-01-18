# GoraHrib Deployment Guide

This guide covers everything you need to deploy the GoraHrib MERN application to production.

## Prerequisites

- Node.js 16+ installed
- MongoDB database (MongoDB Atlas recommended)
- Firebase account for file storage
- Email account for sending verification emails (Gmail recommended)
- A hosting platform (Render, Railway, Heroku, DigitalOcean, AWS, etc.)

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Server Configuration
PORT=3000
NODE_ENV=production

# JWT Secret Key (use a strong random string)
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (Gmail with App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_specific_password

# Frontend URL for CORS and email verification links
CLIENT_URL=https://your-frontend-domain.com

# Firebase Storage
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
```

**Important Notes:**

- `MONGODB_URI`: Get this from MongoDB Atlas or your MongoDB provider
- `JWT_SECRET`: Generate a strong random string (e.g., `openssl rand -base64 32`)
- `EMAIL_PASS`: Use a Gmail App Password, not your regular password
- `CLIENT_URL`: Set to your production frontend URL (e.g., `https://gorahrib.com`)
- `FIREBASE_STORAGE_BUCKET`: Get this from your Firebase project settings

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# Backend API URL
VITE_API_URL=https://your-backend-api.com
```

For production, set `VITE_API_URL` to your deployed backend URL.

**Example:**

```env
VITE_API_URL=https://gorahrib-api.onrender.com
```

## Deployment Options

### Option 1: Deploy to Render (Recommended)

#### Backend Deployment on Render

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name:** gorahrib-backend
   - **Region:** Choose closest to your users
   - **Branch:** main
   - **Root Directory:** backend
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free or Starter

6. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   - Add all variables from the backend `.env.example`
   - Make sure to set `NODE_ENV=production`
   - Set `CLIENT_URL` to your frontend URL

7. Click "Create Web Service"

#### Frontend Deployment on Render

1. In Render Dashboard, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name:** gorahrib-frontend
   - **Root Directory:** frontend
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** dist

4. Add Environment Variable:
   - `VITE_API_URL`: Your backend URL (e.g., `https://gorahrib-backend.onrender.com`)

5. Click "Create Static Site"

### Option 2: Deploy to Railway

#### Backend on Railway

1. Go to [Railway](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure:
   - **Root Directory:** backend
   - **Start Command:** `node server.js`

5. Add all environment variables from Settings → Variables
6. Railway will provide a URL like `https://gorahrib-backend.up.railway.app`

#### Frontend on Railway

1. Create another Railway project
2. Configure:
   - **Root Directory:** frontend
   - **Build Command:** `npm run build`
   - **Start Command:** `npx serve -s dist`

3. Add `VITE_API_URL` environment variable with your backend URL

### Option 3: Deploy to Vercel (Frontend) + Render/Railway (Backend)

#### Backend: Use Render or Railway as described above

#### Frontend on Vercel

1. Go to [Vercel](https://vercel.com/)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** frontend
   - **Build Command:** `npm run build`
   - **Output Directory:** dist

5. Add Environment Variables:
   - `VITE_API_URL`: Your backend URL

6. Deploy!

### Option 4: Self-Hosted (VPS)

If you have a VPS (DigitalOcean, Linode, AWS EC2, etc.):

1. SSH into your server
2. Install Node.js and MongoDB (or use MongoDB Atlas)
3. Clone your repository
4. Set up environment variables
5. Install dependencies in both directories
6. Use PM2 to keep the backend running:
   ```bash
   npm install -g pm2
   cd backend
   pm2 start server.js --name gorahrib-backend
   pm2 save
   pm2 startup
   ```
7. Build frontend and serve with Nginx:
   ```bash
   cd frontend
   npm run build
   # Copy dist/ to /var/www/html or configure Nginx
   ```

## Post-Deployment Checklist

### 1. Update Environment Variables

- [ ] Backend `CLIENT_URL` points to your production frontend
- [ ] Frontend `VITE_API_URL` points to your production backend
- [ ] `NODE_ENV=production` in backend
- [ ] All sensitive keys (JWT_SECRET, MONGODB_URI) are set

### 2. Test Critical Features

- [ ] User registration and email verification
- [ ] User login
- [ ] Password reset
- [ ] Profile picture upload (Firebase)
- [ ] Peak checklist functionality
- [ ] Forum posts with images
- [ ] Leaderboard
- [ ] Friend system

### 3. Security

- [ ] All `.env` files are in `.gitignore`
- [ ] No sensitive data in frontend code
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] JWT tokens are secure

### 4. Performance

- [ ] Frontend build is optimized (`npm run build`)
- [ ] Images are optimized
- [ ] Database indexes are set up
- [ ] CDN for static assets (optional)

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check that `CLIENT_URL` in backend matches your frontend URL exactly
   - Ensure no trailing slashes

2. **API Calls Failing**
   - Verify `VITE_API_URL` is set correctly in frontend
   - Check that backend is running and accessible
   - Check browser console for exact error

3. **Email Not Sending**
   - Verify Gmail App Password is correct
   - Check that less secure app access is not required
   - Verify `EMAIL_USER` and `EMAIL_PASS` are set

4. **File Upload Failing**
   - Check Firebase service account JSON is present
   - Verify `FIREBASE_STORAGE_BUCKET` is correct
   - Check Firebase Storage rules

5. **Database Connection Issues**
   - Verify `MONGODB_URI` is correct
   - Check MongoDB Atlas whitelist (should allow all IPs: `0.0.0.0/0`)
   - Ensure database user has proper permissions

## Monitoring and Maintenance

- Set up error logging (e.g., Sentry)
- Monitor server uptime (e.g., UptimeRobot)
- Regular database backups
- Keep dependencies updated
- Monitor API usage and costs

## Useful Commands

```bash
# Frontend
cd frontend
npm install          # Install dependencies
npm run dev          # Run development server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
cd backend
npm install          # Install dependencies
npm start            # Start server (production)
node server.js       # Start server directly

# Check environment variables are loaded
node -e "console.log(process.env.MONGODB_URI)"
```

## Support

If you encounter issues during deployment, check:

- Application logs in your hosting platform
- Browser console for frontend errors
- Backend terminal/logs for server errors
- MongoDB Atlas logs for database issues

## Production Checklist

Before going live:

- [ ] All environment variables are set in production
- [ ] Frontend is built and deployed
- [ ] Backend is deployed and running
- [ ] Database is accessible and populated with initial data (peaks, achievements)
- [ ] Email verification works
- [ ] File uploads work
- [ ] HTTPS is enabled (most hosting platforms do this automatically)
- [ ] Custom domain configured (optional)
- [ ] Analytics added (optional)

Good luck with your deployment! 🚀
