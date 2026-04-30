# Backend Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Configuration](#supabase-configuration)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Authentication Setup](#authentication-setup)
6. [Payment Gateway Setup](#payment-gateway-setup)
7. [Email & SMS Configuration](#email--sms-configuration)
8. [Blob Storage Setup](#blob-storage-setup)
9. [Running Migrations](#running-migrations)
10. [Testing the Setup](#testing-the-setup)

---

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ and pnpm installed
- A Supabase account (create at https://supabase.com)
- Vercel account (for deployment)
- Payment gateway accounts:
  - Paymob API credentials
  - Vodafone Cash merchant account
  - InstaPay merchant account
- WhatsApp Business account
- Twilio account (for SMS notifications)
- SendGrid account (for email notifications)

---

## Supabase Configuration

### 1. Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Select your organization and enter:
   - Project name: `your-store-name`
   - Database password: Generate a strong password
   - Region: Choose closest to your location
4. Wait for database initialization (5-10 minutes)

### 2. Get Your Credentials

After project creation:
1. Go to Project Settings → API
2. Copy these values:
   - `SUPABASE_URL`: Shown as "Project URL"
   - `SUPABASE_ANON_KEY`: Shown under "anon public"
   - `SUPABASE_SERVICE_ROLE_KEY`: Shown under "service_role secret"

### 3. Enable Authentication Providers

In Supabase Console:
1. Go to Authentication → Providers
2. Enable:
   - Email (default)
   - Google OAuth (optional)
   - Phone (if using SMS)

### 4. Configure RLS (Row Level Security)

RLS policies are applied via migration scripts (see Database Setup section).

---

## Environment Variables

Create `.env.local` in project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# Payment Gateways
PAYMOB_API_KEY=your_paymob_api_key
PAYMOB_MERCHANT_ID=your_merchant_id
PAYMOB_INTEGRATION_ID=card_integration_id
PAYMOB_IFRAME_ID=card_iframe_id

VODAFONE_API_KEY=your_vodafone_key
VODAFONE_MERCHANT_ID=your_vodafone_merchant_id

INSTAPAY_API_KEY=your_instapay_key
INSTAPAY_MERCHANT_ID=your_instapay_merchant_id

# WhatsApp
WHATSAPP_BUSINESS_ACCOUNT_ID=your_account_id
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_API_TOKEN=your_access_token
WHATSAPP_ADMIN_PHONE=+20xxxxxxxxx

# Email Service (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourstore.com

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxx

# Blob Storage (Vercel)
BLOB_READ_WRITE_TOKEN=your_token

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
API_SECRET_KEY=your_secret_key_for_server_endpoints

# Admin Password (for initial setup)
SUPER_ADMIN_PASSWORD=your_super_admin_password
```

Create `.env.example` with the same keys but no values for version control.

---

## Database Setup

### 1. Create Database Tables

Run the migration script:

```bash
cd /vercel/share/v0-project
pnpm run db:migrate
```

This creates all required tables with the proper schema.

### 2. Seed Initial Data

```bash
pnpm run db:seed
```

This creates:
- Default Super Admin account
- Sample stores
- Sample products
- Sample payment methods

### 3. Tables Created

The migration script creates these tables:

**Core Tables:**
- `stores` - Multi-store data
- `users` - User accounts with roles
- `products` - Product catalog per store
- `orders` - Order records
- `order_items` - Individual items in orders
- `payments` - Payment records
- `deliveries` - Delivery tracking
- `notifications` - User notifications

**Admin Tables:**
- `staff_invites` - Invitations for staff
- `audit_logs` - Activity tracking
- `financial_reports` - Generated reports

See `DATABASE_SCHEMA.md` for complete schema.

---

## Authentication Setup

### 1. Enable Email Authentication

Already enabled by default in Supabase. Users can:
- Sign up with email/password
- Reset password via email link
- Verify email addresses

### 2. Create Super Admin Account

Run setup script:

```bash
pnpm run setup:admin
```

This creates the first Super Admin account using `SUPER_ADMIN_PASSWORD`.

### 3. Authentication Flow

- New users register via email/password
- Email verification required
- JWT tokens stored in Supabase session
- Automatic token refresh on page load
- Token expires in 1 hour (configurable)

---

## Payment Gateway Setup

### Paymob Configuration

1. Create account at https://paymob.com
2. Complete merchant verification
3. Go to Settings → API Keys
4. Copy API Key to `PAYMOB_API_KEY`
5. Create payment integrations for:
   - Card payment (iframe)
   - Mobile wallet
6. Copy integration IDs to environment variables

**Test Cards:**
- Visa: 4012002000060016 (CVC: 123, any date)
- Use amount 100 EGP for testing

### Vodafone Cash Setup

1. Register at Vodafone Cash Business Portal
2. Complete business verification
3. Get API credentials and merchant ID
4. Test with test credentials first

### InstaPay Setup

1. Register at InstaPay merchant portal
2. Verify business documents
3. Get API key and merchant ID
4. Use sandbox environment for testing

---

## Email & SMS Configuration

### SendGrid Setup

1. Create account at sendgrid.com
2. Go to Settings → API Keys
3. Create new API key
4. Add to `SENDGRID_API_KEY`
5. Verify sender email at Settings → Sender Authentication

### Twilio Setup

1. Create account at twilio.com
2. Get Account SID and Auth Token from Dashboard
3. Add to environment variables
4. Buy a phone number for SMS sending
5. Add to `TWILIO_PHONE_NUMBER`

---

## Blob Storage Setup

### Vercel Blob Configuration

1. Go to Vercel Dashboard → Storage
2. Create new Blob store
3. Go to Tokens tab
4. Create new read/write token
5. Add to `BLOB_READ_WRITE_TOKEN`

This enables product image and video uploads.

---

## Running Migrations

### First Time Setup

```bash
# Install dependencies
pnpm install

# Run all migrations
pnpm run db:migrate

# Seed database
pnpm run db:seed

# Start development server
pnpm dev
```

### Applying New Migrations

New migrations are automatically detected and applied on:
```bash
pnpm run db:migrate
```

### Rollback (if needed)

```bash
pnpm run db:rollback
```

---

## Testing the Setup

### 1. Test Supabase Connection

```bash
# Visit http://localhost:3000/api/health
# Should return: { status: "ok", database: "connected" }
```

### 2. Test Authentication

1. Visit http://localhost:3000
2. Click "Sign Up"
3. Enter email and password
4. Verify email via link sent to inbox
5. Login with credentials

### 3. Test Payment Gateway

1. Create a test store
2. Add a test product
3. Proceed to checkout
4. Select test payment method
5. Use test card: 4012002000060016
6. Verify payment appears in Paymob dashboard

### 4. Test Email Sending

1. Create test order
2. Check email inbox for order confirmation
3. Verify SendGrid dashboard shows delivery

### 5. Test Blob Storage

1. Upload a product image
2. Verify image appears in product page
3. Check Vercel Blob dashboard for file storage

---

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check Supabase project status in console
- Ensure `SUPABASE_ANON_KEY` is valid

### Authentication Fails

**Solution:**
- Verify email is not already registered
- Check email verification was completed
- Clear browser cookies and try again
- Check auth logs in Supabase console

### Payment Processing Fails

**Solution:**
- Verify payment API keys are correct
- Check payment gateway account is active
- Ensure sufficient funds in merchant account
- Review Paymob dashboard for error details

### Email Not Sending

**Solution:**
- Verify SendGrid API key is valid
- Check sender email is verified in SendGrid
- Review SendGrid Activity feed for bounce reasons
- Ensure email addresses are valid

---

## Production Deployment

See `DEPLOYMENT.md` for:
- Environment variable setup for production
- Supabase backup configuration
- CDN setup for media files
- Monitoring and logging
- Disaster recovery procedures

---

## Support

For issues:
1. Check logs: `pnpm run logs`
2. Review error messages in console
3. Check Supabase dashboard for database issues
4. Contact support with error logs and environment details
