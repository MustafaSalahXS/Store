# Deployment Guide

Complete guide to deploying the multi-store platform to production.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Local Development Setup](#local-development-setup)
3. [Production Environment Setup](#production-environment-setup)
4. [Database Deployment](#database-deployment)
5. [Vercel Deployment](#vercel-deployment)
6. [Domain & DNS Configuration](#domain--dns-configuration)
7. [SSL/TLS Certificates](#ssltls-certificates)
8. [Environment Variables](#environment-variables)
9. [Monitoring & Logging](#monitoring--logging)
10. [Backup & Disaster Recovery](#backup--disaster-recovery)
11. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code & Dependencies

- [ ] All code committed to GitHub
- [ ] No console.log statements in production code
- [ ] No TODO comments in critical code
- [ ] All tests passing (`pnpm test`)
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Dependencies up to date (`pnpm update`)
- [ ] Security vulnerabilities fixed (`pnpm audit`)

### Configuration

- [ ] Environment variables configured
- [ ] API keys secured in Vercel Secrets
- [ ] No hardcoded credentials in code
- [ ] CORS configured correctly
- [ ] Rate limiting configured
- [ ] Error tracking (Sentry) configured
- [ ] Analytics (PostHog) configured

### Testing

- [ ] Local testing completed
- [ ] Payment gateways tested with test cards
- [ ] Email notifications tested
- [ ] SMS notifications tested
- [ ] Delivery tracking tested
- [ ] Multi-store isolation verified
- [ ] RLS policies tested
- [ ] Admin functions verified

### Database

- [ ] All migrations created
- [ ] Database schema validated
- [ ] Indexes created for performance
- [ ] RLS policies configured
- [ ] Backup plan in place
- [ ] Seed data for demo store created

### Content & Assets

- [ ] Logo/branding assets ready
- [ ] Product images optimized
- [ ] Email templates tested
- [ ] SMS templates verified
- [ ] Help documentation reviewed

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- pnpm or npm
- Git
- GitHub account
- Supabase account
- Vercel account

### Clone Repository

```bash
git clone https://github.com/yourusername/multi-store-platform.git
cd multi-store-platform
```

### Install Dependencies

```bash
pnpm install
# or
npm install
```

### Setup Supabase Locally (Optional)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to remote project
supabase link --project-ref xxxxx

# Pull schema
supabase db pull

# Start local Supabase
supabase start
```

### Environment Setup

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# Payment Gateways (use test keys)
PAYMOB_API_KEY=test_key_xxxxx
PAYMOB_MERCHANT_ID=xxxxx
PAYMOB_INTEGRATION_ID=xxxxx
PAYMOB_IFRAME_ID=xxxxx

# Email/SMS
SENDGRID_API_KEY=SG.xxxxxxxxx
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxx

# Blob Storage
BLOB_READ_WRITE_TOKEN=xxxxx

# API Config
NEXT_PUBLIC_API_URL=http://localhost:3000
API_SECRET_KEY=your_secret_dev_key
```

### Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

### Database Migrations

```bash
pnpm run db:migrate
pnpm run db:seed
```

---

## Production Environment Setup

### Supabase Production Project

1. **Create Production Project:**
   - Go to https://supabase.com
   - Create new project
   - Select region (closest to customers)
   - Set strong database password
   - Wait for provisioning (5-10 mins)

2. **Get Production Credentials:**
   - Project Settings → API
   - Copy `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `SUPABASE_SERVICE_ROLE_KEY` (keep secret)

3. **Configure Authentication:**
   - Authentication → Providers
   - Enable email/password
   - Enable Google OAuth (optional)
   - Set redirect URLs (see Vercel setup)

4. **Setup Backups:**
   - Go to Backups section
   - Enable automatic daily backups
   - Set 7-day or 30-day retention

### Vercel Production Project

This is a monorepo with pnpm workspaces. Vercel configuration is handled by `vercel.json` at the root.

1. **Create Vercel Project:**
   - Go to https://vercel.com
   - Click "Add New..."
   - Select "Project"
   - Import GitHub repository
   - Select repository
   - Click "Import"

2. **Configure Project:**
   - Project Name: your-store-name
   - Framework: Next.js (auto-detected)
   - Root Directory: `./` (Vercel reads from vercel.json)
   - Build Command: Leave empty (uses vercel.json)
   - Install Command: Leave empty (uses vercel.json)

   The `vercel.json` file at the repository root automatically configures:
   - Build command: `turbo run build --filter=web`
   - Output directory: `apps/web/.next`
   - Framework detection: Next.js

3. **Add Environment Variables:**
   - Go to Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_URL`: Set to your deployed API URL
     - For separate Vercel API project: `https://your-api-project.vercel.app`
     - For custom domain: `https://api.yourdomain.com`
   - Add all other production secrets
   - Select which environments (Production, Preview, Development)

4. **Deploy API Separately:**
   - The Express API (`apps/api`) must be deployed to a separate service:
     - Create another Vercel project pointing to the same repo
     - Set Root Directory: `apps/api`
     - Or deploy to Railway, Render, or another hosting
   - Once deployed, set `NEXT_PUBLIC_API_URL` to the API's URL

5. **Domains:**
   - Go to Domains
   - Add your domain for the web app
   - Add a subdomain (e.g., `api.yourdomain.com`) for the API if using custom domain

6. **Deploy:**
   - Click "Deploy"
   - Wait for build (3-5 mins)
   - Check deployment logs for errors

7. **Test API Routes:**
   - Once deployed, verify API calls work
   - Check browser DevTools Network tab for `/api/*` requests
   - Verify they proxy to your backend correctly

---

## Database Deployment

### Run Migrations on Production

```bash
# Connect to production database
export SUPABASE_URL=your_production_url
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run all migrations
pnpm run db:migrate

# Verify schema
pnpm run db:verify
```

### Seed Production Data

```bash
# Only run this once!
pnpm run db:seed:production
```

This creates:
- Super admin account
- Sample store
- Sample products
- Sample payment methods

### Verify RLS Policies

```bash
# Check RLS is enabled
psql postgresql://user:password@host/database -c "SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';"

# Should show "t" (true) for all tables
```

---

## Vercel Deployment

### Deploy from GitHub

Automatically deploys on push:

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "Add my feature"

# Push to GitHub
git push origin feature/my-feature

# Create pull request on GitHub
# Vercel automatically creates preview deployment
# Test preview deployment
# Merge PR when ready

# Vercel automatically deploys to production
```

### Manual Deployment

```bash
# Install Vercel CLI
pnpm install -g vercel

# Link project
vercel link

# Deploy to production
vercel --prod
```

### Production Deployment Checks

After deployment:

1. **Verify Site is Up:**
   ```bash
   curl https://yourdomain.com
   # Should return HTML (not 5xx error)
   ```

2. **Check API Endpoints:**
   ```bash
   curl https://yourdomain.com/api/health
   # Should return { "status": "ok" }
   ```

3. **Test Login:**
   - Visit https://yourdomain.com
   - Try signup/login
   - Verify email works

4. **Test Payment:**
   - Create test order
   - Try test card: 4012002000060016
   - Check Paymob dashboard

5. **Check Logs:**
   - Go to Vercel Dashboard
   - Click project
   - Go to Deployments
   - Click latest deployment
   - View logs for errors

---

## Domain & DNS Configuration

### Add Custom Domain

**Via Vercel:**

1. In Vercel Dashboard → Project Settings → Domains
2. Enter domain (e.g., mystore.com)
3. Click "Add"
4. Vercel shows required DNS records

**Via Your DNS Provider:**

1. Login to your domain registrar (GoDaddy, Namecheap, etc.)
2. Go to DNS settings
3. Add the records Vercel shows:
   - CNAME record: `yoursubdomain` → Vercel alias
   - Or A records to Vercel IPs

4. Wait for DNS to propagate (can take 24-48 hours)

### Verify DNS

```bash
# Check DNS propagation
nslookup yourdomain.com
# Should resolve to Vercel IP

# Or use online tool:
# https://mxtoolbox.com/

# Check SSL certificate (after DNS is live)
curl -I https://yourdomain.com
# Should show 200 OK
```

---

## SSL/TLS Certificates

### Automatic SSL (Recommended)

Vercel automatically:
- Provisions SSL certificate (Let's Encrypt)
- Renews certificate before expiry
- Redirects HTTP → HTTPS
- Sets security headers

No manual action needed!

### Manual Certificate (If Needed)

1. Create certificate:
   ```bash
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
   ```

2. Upload to Vercel or origin server

3. Configure HTTPS redirect

### Verify SSL

```bash
# Check certificate
openssl s_client -connect yourdomain.com:443

# Or use SSL Labs:
# https://www.ssllabs.com/ssltest/
```

---

## Environment Variables

### Production Environment Variables

Create in Vercel Dashboard (Settings → Environment Variables):

```env
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx (Secret)

# Payment Gateways (Production Keys)
PAYMOB_API_KEY=live_key_xxxxx (Secret)
PAYMOB_MERCHANT_ID=xxxxx
PAYMOB_INTEGRATION_ID=xxxxx
PAYMOB_IFRAME_ID=xxxxx

VODAFONE_API_KEY=xxxxx (Secret)
VODAFONE_MERCHANT_ID=xxxxx

INSTAPAY_API_KEY=xxxxx (Secret)
INSTAPAY_MERCHANT_ID=xxxxx

# WhatsApp Business
WHATSAPP_BUSINESS_ACCOUNT_ID=xxxxx
WHATSAPP_PHONE_NUMBER_ID=xxxxx
WHATSAPP_API_TOKEN=xxxxx (Secret)
WHATSAPP_ADMIN_PHONE=+20xxxxxxxxx

# Email Service
SENDGRID_API_KEY=SG.xxxxxxxxx (Secret)
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# SMS Service
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx (Secret)
TWILIO_PHONE_NUMBER=+1xxxxxxxxx

# Storage
BLOB_READ_WRITE_TOKEN=xxxxx (Secret)

# API Configuration
NEXT_PUBLIC_API_URL=https://yourdomain.com
API_SECRET_KEY=your_production_secret_key (Secret)

# Error Tracking
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
```

### Environment Variable Management

**DO:**
- Use Vercel secrets for sensitive values
- Rotate keys regularly (quarterly)
- Use different keys per environment
- Document each variable

**DON'T:**
- Hardcode secrets in code
- Commit secrets to GitHub
- Reuse test keys in production
- Share keys in Slack/email

---

## Monitoring & Logging

### Sentry Configuration

1. **Create Sentry Account:**
   - Go to https://sentry.io
   - Create organization
   - Create project (Next.js)
   - Get DSN

2. **Add to Vercel:**
   - Add `SENTRY_DSN` environment variable
   - Restart deployment

3. **Monitor Errors:**
   - Go to Sentry Dashboard
   - View errors in real-time
   - Set up alerts for critical errors
   - Create issue in GitHub from errors

### PostHog Analytics

1. **Create PostHog Account:**
   - Go to https://posthog.com
   - Create project
   - Get API key

2. **Add to Vercel:**
   - Add `NEXT_PUBLIC_POSTHOG_KEY` environment variable
   - Restart deployment

3. **View Analytics:**
   - Go to PostHog Dashboard
   - Track user behavior
   - Monitor feature usage
   - Set up funnels

### Logs

**Access Logs:**

```bash
# Via Vercel CLI
vercel logs

# Via Vercel Dashboard
# Project → Deployments → [Click Deployment] → Logs
```

**Error Logs:**
- Sentry Dashboard shows all errors
- Stack traces included
- Environment context attached

---

## Backup & Disaster Recovery

### Supabase Backups

**Automatic Daily Backups:**
- Supabase automatically backs up daily
- Retention: 7 days (Pro) / 30 days (Enterprise)
- Access in Supabase Dashboard → Backups

**Restore from Backup:**

1. Go to Supabase Dashboard
2. Click project
3. Go to Backups
4. Click restore button on desired backup
5. Confirm restoration
6. Database restored to that point in time
7. May cause a few minutes of downtime

### Manual Backup

```bash
# Export database
pg_dump postgresql://user:password@host/db > backup.sql

# Export specific table
pg_dump -t orders postgresql://user:password@host/db > orders_backup.sql

# Upload backup
gsutil cp backup.sql gs://your-bucket/
```

### Restore Manual Backup

```bash
# Restore entire database
psql postgresql://user:password@host/db < backup.sql

# Restore specific table
psql postgresql://user:password@host/db < orders_backup.sql
```

### Disaster Recovery Plan

**If Production Down:**

1. **Immediate (First 5 mins):**
   - Check Vercel status page
   - Check Supabase status page
   - Check DNS/domain status
   - Check error logs (Sentry)

2. **Short-term (5-30 mins):**
   - If database issue: Restore latest backup
   - If code issue: Rollback previous deployment
   - If infrastructure issue: Contact Vercel/Supabase support

3. **Recovery:**
   - Verify system is back up
   - Check data integrity
   - Run database consistency checks
   - Test critical workflows
   - Notify users if needed

**Rollback Deployment:**

```bash
# Via Vercel Dashboard
# Deployments → [Click Previous] → Redeploy

# Via Vercel CLI
vercel rollback
```

---

## Troubleshooting

### 500 Error on Production

**Solutions:**
1. Check Vercel logs (Deployments → Logs)
2. Check Sentry for error details
3. Verify all environment variables are set
4. Check database connection
5. Rollback to previous deployment
6. Contact Vercel support

### Database Connection Failed

**Solutions:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check `SUPABASE_ANON_KEY` is valid
3. Check Supabase project is running
4. Check network (firewall blocking connection)
5. Restart Supabase project
6. Contact Supabase support

### Email Not Sending

**Solutions:**
1. Verify `SENDGRID_API_KEY` is correct and active
2. Check sender email is verified in SendGrid
3. Check email address format
4. Review SendGrid Activity feed for bounces
5. Check spam folder
6. Test with different email address

### Payment Gateway Errors

**Solutions:**
1. Verify API keys are correct (test vs production)
2. Check payment gateway account status
3. Verify integration IDs (Paymob)
4. Test with test card in Paymob dashboard
5. Check payment gateway logs
6. Contact payment provider support

### High Database Latency

**Solutions:**
1. Check database connections (Supabase dashboard)
2. Add missing indexes (see ARCHITECTURE.md)
3. Optimize slow queries
4. Consider caching (Redis)
5. Upgrade Supabase plan if needed
6. Monitor with Query Profiler

---

## Success Checklist

After deployment:

- [ ] Site loads without errors (https://yourdomain.com)
- [ ] API endpoints working (/api/health)
- [ ] User registration works
- [ ] Login works
- [ ] Email verification works
- [ ] Create product works
- [ ] Create order works
- [ ] Payment processing works
- [ ] Delivery tracking works
- [ ] Admin dashboard accessible
- [ ] Financial reports generating
- [ ] Error tracking (Sentry) working
- [ ] Analytics (PostHog) tracking events
- [ ] Backups running daily
- [ ] SSL certificate valid
- [ ] No security warnings

Congratulations! Your production deployment is ready!
