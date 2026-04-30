# Vercel Deployment Setup — Option 1: Web Root Directory

This guide sets up the **web (frontend)** app on Vercel with the correct Root Directory.

## Step 1: Update Vercel Project Settings (Web)

1. Go to https://vercel.com → Dashboard
2. Select your web project (the one currently deployed)
3. Click **Settings** (gear icon)
4. Go to **General** tab
5. Find **Root Directory** and change it from `./` to `apps/web`
6. Click **Save**

Expected settings after change:
- **Root Directory**: `apps/web`
- **Framework**: Next.js (auto-detected)
- **Build Command**: `next build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `pnpm install --frozen-lockfile`

## Step 2: Set Environment Variables (Web Project)

1. Still in **Settings**
2. Go to **Environment Variables** tab
3. Add these variables (select **Production**, **Preview**, **Development** for all):

| Variable | Value | Example |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | From your .env | `https://ytdrxqerbsriigyotgtd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From your .env | `sb_publishable_WGV5woyK...` |
| `NEXT_PUBLIC_API_URL` | Your deployed API URL | `https://your-api.vercel.app` or `https://api.yourdomain.com` |

**Important:** Do NOT add server-side variables (like `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) to the web project. Those go in the **API project only**.

## Step 3: Redeploy

1. After saving Root Directory, go to **Deployments** tab
2. Click the three dots (⋯) on the latest deployment
3. Select **Redeploy**
4. Wait for build to complete (should be ~1-2 minutes)
5. Check build logs — should NOT see "No Output Directory named '.next' found"

Expected output in logs:
```
✓ Compiled successfully
✓ Generating static pages
```

## Step 4: Deploy the API (Separate Project)

Your API (`apps/api`) must be deployed separately. Choose one:

### Option A: Vercel (Another Project)
1. Go to https://vercel.com → Dashboard
2. Click **Add New** → **Project**
3. Import the same GitHub repo
4. During import:
   - **Project Name**: `your-store-api`
   - **Root Directory**: `apps/api`
5. Click **Deploy**
6. Once deployed, copy the API project URL (e.g., `https://your-store-api.vercel.app`)

### Option B: Railway.app
1. Go to https://railway.app
2. Click **New Project** → **Deploy from GitHub**
3. Select your repository
4. In the Railway dashboard:
   - Set **Root Directory**: `apps/api`
   - Set **Start Command**: `node dist/index.js`
5. Deploy and copy the URL

### Option C: Render
1. Go to https://render.com
2. Click **New +** → **Web Service**
3. Connect GitHub
4. Configure:
   - **Root Directory**: `apps/api`
   - **Build Command**: `pnpm install --frozen-lockfile && pnpm build`
   - **Start Command**: `node dist/index.js`
5. Deploy and copy the URL

## Step 5: Set API Environment Variables

In your API project (Vercel/Railway/Render), add these Environment Variables:

| Variable | Value | Source |
|---|---|---|
| `DATABASE_URL` | Supabase pooler URL | From `.env` |
| `DIRECT_URL` | Supabase direct URL | From `.env` |
| `SUPABASE_URL` | Supabase project URL | From `.env` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | From `.env` |
| `FRONTEND_URL` | Your deployed web URL | `https://your-web.vercel.app` |
| `JWT_SECRET` | Random string | Generate: `openssl rand -hex 32` |
| `PORT` | `4000` | Fixed |
| `PAYMOB_*` | From your `.env` | Copy all PAYMOB_ vars |

**CRITICAL**: Set `FRONTEND_URL` to your deployed frontend URL so the API allows CORS requests from the frontend.

## Step 6: Update Web App with API URL

1. Go back to your **web project** in Vercel
2. Go to **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_API_URL` to your deployed API URL
   - Example: `https://your-store-api.vercel.app`
4. Click **Save**
5. Go to **Deployments** → Redeploy the latest deployment
6. Wait for build

## Step 7: Test

1. Open your deployed web app: https://your-web.vercel.app
2. Open browser DevTools → **Network** tab
3. Navigate to a page that fetches data (e.g., Shop, Products)
4. Look for API calls like `/api/products`
   - Should see request to `https://your-api.vercel.app/api/products`
   - Status should be **200** (not 404 or CORS error)

### Debug Checklist

If fetches still fail:

- [ ] Open DevTools → **Console** tab — any errors?
- [ ] DevTools → **Network** → check `/api/*` request:
  - Status 404? → API URL might be wrong or API not running
  - Status 0 or CORS error? → API `FRONTEND_URL` not set correctly
- [ ] Test API directly: `curl https://your-api.vercel.app/health`
  - Should return `{"status":"ok","timestamp":"..."}`
- [ ] Check API deployment logs for startup errors
- [ ] Verify all env vars in API project are set

## Summary

- **Web project**: Root Directory = `apps/web`, `NEXT_PUBLIC_API_URL` = deployed API URL
- **API project**: Separate Vercel/Railway/Render project, `FRONTEND_URL` = web app URL
- Both projects use their own environment variables
- Frontend makes requests to `NEXT_PUBLIC_API_URL` (set in Vercel env vars)
- API allows requests from `FRONTEND_URL` via CORS
