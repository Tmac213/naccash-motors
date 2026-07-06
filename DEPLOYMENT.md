# Deployment Guide - Naccash Motors

## Overview
This project uses:
- **Backend**: Render (Node.js/Express)
- **Frontend**: Firebase Hosting (Next.js)
- **Database**: Render PostgreSQL or external database
- **Storage**: Cloudinary for image uploads

## Prerequisites
- Firebase CLI: `npm install -g firebase-tools`
- GitHub account (for Render integration)
- Cloudinary account
- Environment variables configured

## Backend Deployment (Render)

### 1. Connect GitHub to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Select "Deploy existing code from a Git repository"
4. Connect your GitHub account and select this repository

### 2. Configure Backend Service
- **Name**: `naccash-motors-backend`
- **Runtime**: Node
- **Branch**: `main`
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm start`
- **Environment Variables**: Copy from `.env.example` and fill with real values

### 3. Deploy
- Environment variables will be set via Render dashboard
- Render will auto-deploy on push to main branch

## Frontend Deployment (Firebase)

### 1. Build Frontend
```bash
cd frontend
npm run build
```

### 2. Configure Firebase
```bash
firebase login
firebase init hosting
```

### 3. Deploy to Firebase
```bash
npm run deploy:firebase
```

Or manually:
```bash
firebase deploy --only hosting
```

## Environment Variables Setup

### Backend (Render Dashboard)
Copy all variables from `backend/.env.example` and set them in Render's environment variable settings.

### Frontend (Firebase)
Create `frontend/.env.local` with variables from `frontend/.env.example`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# etc.
```

## Database Setup

### PostgreSQL on Render
1. Create PostgreSQL database on Render
2. Set `DATABASE_URL` in backend environment variables
3. Run migrations:
```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

## Continuous Deployment

- **Backend**: Auto-deploys on push to `main` branch (Render)
- **Frontend**: Manually deploy or set up GitHub Actions for auto-deployment

## Useful Commands

```bash
# Deploy both
npm run deploy

# Deploy frontend only
npm run deploy:firebase

# Deploy backend only
# Use Render dashboard or push to GitHub

# View Firebase hosting
firebase open hosting

# Check Firebase status
firebase status
```

## Troubleshooting

- **Firebase deployment fails**: Run `firebase init` again and ensure `firebase.json` is correct
- **Backend not running**: Check Render logs in dashboard
- **Environment variables not loaded**: Ensure they're set in Render dashboard (not .env)
- **CORS issues**: Check backend CORS configuration in Express

## Support
For more info, see:
- [Render Docs](https://render.com/docs)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Next.js Deployment](https://nextjs.org/docs/deployment/static-exports)
