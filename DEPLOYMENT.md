# 🚀 Deploy Eunoia to Vercel

## Quick Deployment Guide

### 1. Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository

### 2. Set Up Database
1. In Vercel dashboard, go to Storage
2. Create a new Postgres database
3. Copy the connection string

### 3. Configure Environment Variables
In Vercel dashboard, go to Settings > Environment Variables and add:

```
DATABASE_URL=your-vercel-postgres-url
SESSION_SECRET=your-super-secure-session-secret
NODE_ENV=production
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-app-password
FROM_EMAIL=your-email@example.com
```

### 4. Deploy
1. Push your code to GitHub
2. Vercel will automatically deploy
3. Your app will be available at: `https://your-app-name.vercel.app`

## 🎉 That's it! Your app is live!

### Next Steps:
- Set up custom domain
- Configure email service (SendGrid/Resend)
- Add PWA features for mobile app


