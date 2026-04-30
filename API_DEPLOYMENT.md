# API Deployment Guide

Since this is a monorepo with separate `apps/web` (Next.js frontend) and `apps/api` (Express backend), the API must be deployed separately.

## Options for Deploying the API

### Option 1: Vercel (Recommended)

1. **Create a second Vercel project for the API:**
   - Go to https://vercel.com
   - Click "Add New..." → "Project"
   - Import the same GitHub repository
   - During import configuration:
     - Project Name: `your-store-api`
     - Framework: **Other** (Express)
     - Root Directory: `apps/api`

2. **Configure Build Settings:**
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install --frozen-lockfile`

3. **Add Environment Variables:**
   In Vercel Dashboard → Settings → Environment Variables, add:
   ```
   DATABASE_URL=your_production_database_url
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=sk_live_xxx
   PAYSTACK_SECRET_KEY=sk_live_xxx
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Get API URL:**
   - Once deployed, copy the API project URL (e.g., `https://your-store-api.vercel.app`)
   - Add this as `NEXT_PUBLIC_API_URL` environment variable in your web project

### Option 2: Railway.app

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Set:
   - Root directory: `apps/api`
   - Start command: `node dist/index.js`
   - Build command: `pnpm build`
5. Add environment variables in the Railway dashboard
6. Deploy and copy the URL to your web app's `NEXT_PUBLIC_API_URL`

### Option 3: Render

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - Root directory: `apps/api`
   - Runtime: Node
   - Build command: `pnpm install --frozen-lockfile && pnpm build`
   - Start command: `node dist/index.js`
5. Set environment variables
6. Deploy and update web app's `NEXT_PUBLIC_API_URL`

## Verifying the Setup

After both frontend and API are deployed:

1. **In your web app's Vercel dashboard:**
   - Add `NEXT_PUBLIC_API_URL` environment variable with your API URL
   - Redeploy the web app

2. **Test the connection:**
   ```bash
   # From your local machine
   curl https://your-api-project.vercel.app/api/health
   ```

3. **Check browser console:**
   - Open your deployed web app
   - Open DevTools → Network tab
   - Try to fetch products
   - Verify `/api/products` requests are proxied to your backend

## Troubleshooting

### 404 errors on API calls
- Ensure `NEXT_PUBLIC_API_URL` is set correctly in web app
- Check that the API app is deployed and running
- Verify environment variables are set in the API project

### CORS errors
- Ensure API has CORS middleware enabled
- Check that frontend URL is whitelisted

### Database connection errors
- Verify `DATABASE_URL` is correct and accessible from Vercel
- Test connection locally first
- Check database firewall rules allow Vercel IPs

## Local Development

For local development before deploying:

```bash
# Terminal 1: Start the API
cd apps/api
pnpm dev

# Terminal 2: Start the web app
cd apps/web
pnpm dev
```

The web app will automatically proxy API calls to `http://localhost:3001` (local API) via the rewrite rules in `next.config.mjs`.
