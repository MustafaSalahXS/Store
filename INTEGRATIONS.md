# Integration Guide - Timeless Templates

This guide helps you integrate payment processing, email, and other services with your wedding template marketplace.

## Payment Processing

### Paymob Integration (Recommended)

**Why Paymob?** Supports Egyptian and international cards, mobile wallets, and is one of Africa's leading payment processors.

#### Setup Steps:

1. Create a Paymob account at [paymob.com](https://paymob.com)
2. Get your API Key from the dashboard
3. Create an iFrame (payment gateway) for checkout

#### Implementation:

Create `/app/api/checkout.ts`:

```typescript
// api/checkout.ts
import { NextRequest, NextResponse } from 'next/server'

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID

export async function POST(request: NextRequest) {
  const { productId, amount, email } = await request.json()

  try {
    // Step 1: Authenticate
    const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: PAYMOB_API_KEY })
    })
    const { token } = await authRes.json()

    // Step 2: Create order
    const orderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        merchant_id: process.env.PAYMOB_MERCHANT_ID,
        amount_cents: Math.round(amount * 100),
        currency: 'USD',
        items: [{
          name: productId,
          amount_cents: Math.round(amount * 100),
          quantity: 1
        }]
      })
    })
    const { id: orderId } = await orderRes.json()

    // Step 3: Generate payment key
    const paymentRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: Math.round(amount * 100),
        expiration: 3600,
        order_id: orderId,
        billing_data: { email },
        currency: 'USD',
        integration_id: PAYMOB_INTEGRATION_ID
      })
    })
    const { token: paymentKey } = await paymentRes.json()

    return NextResponse.json({ paymentKey, orderId })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Payment setup failed' }, { status: 500 })
  }
}
```

Add to product detail page:

```typescript
// In /app/product/[id]/page.tsx
const handleCheckout = async () => {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({
      productId: product.id,
      amount: product.price,
      email: userEmail
    })
  })
  const { paymentKey } = await response.json()
  
  // Redirect to Paymob iFrame
  window.location.href = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`
}
```

### Stripe Integration

#### Setup:

1. Create Stripe account at [stripe.com](https://stripe.com)
2. Install Stripe library: `npm install @stripe/stripe-js`

#### Basic Implementation:

```typescript
// api/stripe-checkout.ts
import { Stripe } from '@stripe/stripe-js'

const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

export async function createCheckout(productId: string, amount: number) {
  const response = await fetch('/api/create-checkout', {
    method: 'POST',
    body: JSON.stringify({ productId, amount })
  })
  
  const { sessionId } = await response.json()
  const result = await stripe?.redirectToCheckout({ sessionId })
  
  if (result?.error) {
    alert(result.error.message)
  }
}
```

## Email Service Integration

### Resend (Recommended for Developers)

Simple, reliable email for developers.

#### Setup:

1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Install: `npm install resend`

#### Implementation:

Create `/app/api/send-download.ts`:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendDownloadLink(email: string, productId: string, downloadUrl: string) {
  await resend.emails.send({
    from: 'noreply@timelestemplates.com',
    to: email,
    subject: 'Your Wedding Template - Download Link Inside',
    html: `
      <h1>Thank you for your purchase!</h1>
      <p>Your template is ready to download.</p>
      <a href="${downloadUrl}" style="background: #D4A574; padding: 12px 24px; color: white; text-decoration: none; border-radius: 8px; display: inline-block;">
        Download Now
      </a>
      <p>Your download link will expire in 7 days.</p>
      <p>Need help? <a href="https://timelestemplates.com/support">Contact our support team</a></p>
    `
  })
}
```

### SendGrid (Enterprise)

For larger volumes and advanced features.

```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export async function sendDownload(email: string, product: Product) {
  await sgMail.send({
    to: email,
    from: 'noreply@timelestemplates.com',
    subject: `Your ${product.name} is Ready!`,
    html: `...`
  })
}
```

## Analytics & Tracking

### Vercel Analytics (Built-in)

Already configured! Tracks page views automatically.

```typescript
// In layout.tsx - already included
import { Analytics } from '@vercel/analytics/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
```

### PostHog (Product Analytics)

Track funnels, user behavior, and conversions.

#### Setup:

1. Create PostHog account at [posthog.com](https://posthog.com)
2. Install: `npm install posthog-js`

#### Implementation:

```typescript
// lib/posthog.ts
import posthog from 'posthog-js'

export function initAnalytics() {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: 'https://app.posthog.com'
  })
}

// Track events
export function trackPurchase(productId: string, amount: number) {
  posthog.capture('purchase_completed', {
    product_id: productId,
    amount
  })
}
```

### Google Analytics

Standard web analytics for reach and traffic.

```typescript
// In layout.tsx
import Script from 'next/script'

<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
</Script>
```

## Authentication (Optional)

### Supabase Auth

Add user accounts for admin and download management.

```typescript
// Enable auth in admin dashboard
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AdminPage() {
  const supabase = createClientComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Please log in to access admin</div>
  }
  
  return <AdminDashboard />
}
```

## CRM & Customer Management

### Mailchimp (Email Lists)

Manage customer email lists and campaigns.

```typescript
import mailchimp from '@mailchimp/mailchimp_marketing'

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: 'us12'
})

export async function addToMailchimp(email: string, name: string) {
  await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
    email_address: email,
    status: 'subscribed',
    merge_fields: { FNAME: name.split(' ')[0] }
  })
}
```

### HubSpot

Full CRM for managing customers and sales.

```typescript
import * as hubspot from '@hubspot/api-client'

const client = new hubspot.Client({ accessToken: process.env.HUBSPOT_TOKEN })

export async function createContact(email: string, product: Product) {
  await client.crm.contacts.basicApi.create({
    properties: [
      { name: 'email', value: email },
      { name: 'product_purchased', value: product.name },
      { name: 'purchase_amount', value: product.price }
    ]
  })
}
```

## SMS Notifications (Optional)

### Twilio

Send order confirmations via SMS.

```typescript
import twilio from 'twilio'

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function sendSMS(phone: string, productName: string) {
  await client.messages.create({
    body: `Your ${productName} template is ready! Download: link`,
    from: process.env.TWILIO_PHONE,
    to: phone
  })
}
```

## File Storage

### Vercel Blob (Recommended)

Store and serve template files directly.

```typescript
import { put, get } from '@vercel/blob'

// Upload template after purchase
export async function storeTemplate(file: File, productId: string) {
  const blob = await put(`templates/${productId}/${file.name}`, file, {
    access: 'private' // Only download link works
  })
  return blob.url
}

// Generate download link
export async function getDownloadLink(filename: string) {
  return `${process.env.BLOB_URL}/templates/${filename}`
}
```

## Environment Variables

Add these to `.env.local`:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Payment Processing
PAYMOB_API_KEY=your_key
PAYMOB_MERCHANT_ID=your_id
PAYMOB_INTEGRATION_ID=your_id
STRIPE_PUBLIC_KEY=pk_...
STRIPE_SECRET_KEY=sk_...

# Email
RESEND_API_KEY=re_...
SENDGRID_API_KEY=sg_...

# Analytics
NEXT_PUBLIC_GA_ID=G_...
NEXT_PUBLIC_POSTHOG_KEY=phc_...

# CRM
MAILCHIMP_API_KEY=...
MAILCHIMP_LIST_ID=...
HUBSPOT_TOKEN=pat-...

# SMS
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE=+1234567890

# File Storage
BLOB_READ_WRITE_TOKEN=...
```

## Webhook Handlers

### Handle Payment Webhooks

```typescript
// api/webhooks/paymob.ts
export async function POST(request: NextRequest) {
  const data = await request.json()
  
  if (data.success && data.amount_cents > 0) {
    // Payment successful
    // Send download link email
    // Log to database
    // Send analytics event
  }
  
  return NextResponse.json({ received: true })
}
```

## Testing

Use these testing tools before going live:

- **Stripe Test Cards**: 4242 4242 4242 4242
- **Paymob Sandbox**: Automatic, no setup needed
- **Email Testing**: Mailtrap.io or similar

## Deployment Checklist

- [ ] Environment variables set in production
- [ ] Payment integration tested with real transactions
- [ ] Email delivery confirmed
- [ ] Analytics events firing
- [ ] Download links working
- [ ] Error handling for payment failures
- [ ] Security headers configured
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Database backups configured (Supabase)
- [ ] Monitoring setup (errors, performance)

## Support & Resources

- Paymob Docs: https://docs.paymob.com
- Stripe Docs: https://stripe.com/docs
- Resend Docs: https://resend.com/docs
- PostHog Docs: https://posthog.com/docs
- Supabase Docs: https://supabase.com/docs
