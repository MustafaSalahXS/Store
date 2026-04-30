# System Architecture Documentation

## Overview

The platform is a modern, scalable e-commerce system built with Next.js, Supabase, and multiple payment integrations. It supports multiple independent stores with role-based access control.

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Architecture Diagram](#architecture-diagram)
3. [Database Architecture](#database-architecture)
4. [Authentication Flow](#authentication-flow)
5. [API Architecture](#api-architecture)
6. [Payment Processing](#payment-processing)
7. [Delivery System](#delivery-system)
8. [Multi-Tenancy Design](#multi-tenancy-design)
9. [Security Model](#security-model)
10. [Scalability](#scalability)

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + custom components
- **State Management**: React Context + SWR
- **Internationalization**: next-intl (Arabic, English, French)
- **Payment UI**: Payment provider SDKs
- **Real-time**: SWR polling + WebSocket (future)

### Backend
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL via Supabase
- **ORM**: Raw SQL queries (not using ORM for flexibility)
- **Authentication**: Supabase Auth + JWT
- **File Storage**: Vercel Blob
- **Email**: SendGrid
- **SMS**: Twilio
- **Payment Gateways**:
  - Paymob (cards & wallets)
  - Vodafone Cash
  - InstaPay
- **Monitoring**: Sentry (errors), PostHog (analytics)
- **Caching**: Redis (optional via Upstash)

### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL)
- **CDN**: Vercel Edge Network
- **Storage**: Vercel Blob
- **Monitoring**: Sentry + PostHog
- **CI/CD**: GitHub Actions

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Users / Browsers                      │
├──────────────────┬───────────────────┬──────────────────┤
│   Customers      │     Admins        │  Delivery Team   │
│   (Web/Mobile)   │  (Web Dashboard)  │  (Mobile App)    │
└────────┬─────────┴─────────┬─────────┴────────┬─────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Next.js App   │
                    │   (Vercel)      │
                    │                 │
                    │ ┌─────────────┐ │
                    │ │  Frontend   │ │
                    │ │  Pages      │ │
                    │ └────────┬────┘ │
                    │          │      │
                    │ ┌────────▼────┐ │
                    │ │  API Routes │ │
                    │ │  /api/*     │ │
                    │ └────────┬────┘ │
                    └─────────┬───────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌────▼─────┐        ┌─────▼──┐
   │Supabase │          │Vercel    │        │Payment │
   │Database │          │Blob      │        │APIs    │
   │         │          │Storage   │        │        │
   │PostgreSQL          │(Images)  │        │Paymob  │
   │+ Auth  │          │          │        │Vodafone│
   │+ RLS   │          │          │        │InstaPay│
   └────────┘          └──────────┘        └────────┘

   ┌──────────────────────────────────────────────┐
   │         External Services                     │
   ├──────────────────────────────────────────────┤
   │ SendGrid (Email) │ Twilio (SMS)             │
   │ Sentry (Errors)  │ PostHog (Analytics)      │
   └──────────────────────────────────────────────┘
```

---

## Database Architecture

### Multi-Tenancy Isolation

All data tables include `store_id` for store isolation:

```
stores
  ├── users (store_id)
  ├── products (store_id)
  ├── orders (store_id)
  ├── payments (store_id)
  ├── deliveries (store_id)
  ├── notifications (store_id)
  └── financial_reports (store_id)
```

### Row Level Security (RLS)

Policies ensure:
- Customers see only published products
- Admins see only their store data
- Accountants access only financial data
- Delivery personnel see assigned orders

### Relationships

```
stores
  │ (admin_id)
  └── users (with role)

products
  ├── (store_id)
  ├── product_images
  └── product_themes

orders
  ├── (store_id, user_id)
  ├── order_items
  │   └── products
  └── payments

deliveries
  ├── (store_id, order_id)
  ├── delivery_status_history
  └── (assigned_personnel_id)
```

---

## Authentication Flow

### User Registration

```
User submits email/password
         │
         ▼
Validate input
         │
         ▼
Create in auth.users (Supabase)
         │
         ▼
Create user record in public.users
         │
         ▼
Send verification email
         │
         ▼
User clicks email link
         │
         ▼
Mark email_verified = true
         │
         ▼
User can now login
```

### Login Flow

```
User submits email/password
         │
         ▼
Call supabase.auth.signInWithPassword()
         │
         ▼
Supabase returns JWT token + refresh token
         │
         ▼
Store in secure HTTP-only cookie (server-side)
         │
         ▼
Fetch user data from public.users
         │
         ▼
Store user data in React Context
         │
         ▼
Redirect to dashboard/home
```

### Token Management

- **Access Token**: 1 hour expiry
- **Refresh Token**: 7 days expiry
- **Automatic Refresh**: When page loads or token expires
- **Storage**: HTTP-only cookies (secure)
- **Logout**: Clear tokens from server and client

### Role-Based Access Control (RBAC)

```
super_admin
  └── Manage all stores, create/delete stores, super admin functions

store_admin
  └── Manage single store, create products, manage staff, view financials

accountant
  └── View financial reports, analyze payments, export data

delivery_personnel
  └── View assigned orders, update delivery status, track locations

customer
  └── Browse products, make orders, track deliveries
```

---

## API Architecture

### Folder Structure

```
app/
├── api/
│   ├── auth/
│   │   ├── register/route.ts
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   └── verify-email/route.ts
│   ├── stores/
│   │   ├── route.ts (GET all, POST create)
│   │   ├── [storeId]/
│   │   │   ├── route.ts (GET, PUT)
│   │   │   ├── products/route.ts
│   │   │   ├── orders/route.ts
│   │   │   └── staff/route.ts
│   ├── products/
│   │   ├── route.ts (GET list, POST create)
│   │   └── [productId]/route.ts (GET, PUT, DELETE)
│   ├── orders/
│   │   ├── route.ts (GET list, POST create)
│   │   └── [orderId]/
│   │       ├── route.ts
│   │       ├── payments/route.ts
│   │       └── delivery/route.ts
│   ├── payments/
│   │   ├── route.ts
│   │   ├── [paymentId]/route.ts
│   │   └── webhooks/
│   │       ├── paymob/route.ts
│   │       ├── vodafone/route.ts
│   │       └── instapay/route.ts
│   └── deliveries/
│       ├── route.ts
│       └── [deliveryId]/status/route.ts
│
├── (admin)/
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── staff/page.tsx
│   │   └── settings/page.tsx
│
├── (shop)/
│   ├── page.tsx (homepage)
│   ├── products/page.tsx
│   ├── [productSlug]/page.tsx
│   ├── cart/page.tsx
│   └── checkout/page.tsx
│
└── (delivery)/
    ├── delivery/
    │   ├── dashboard/page.tsx
    │   ├── orders/page.tsx
    │   └── [orderId]/page.tsx
```

### Endpoint Pattern

All endpoints follow REST conventions:

```
GET     /api/products              → List products
POST    /api/products              → Create product
GET     /api/products/[id]         → Get product
PUT     /api/products/[id]         → Update product
DELETE  /api/products/[id]         → Delete product

GET     /api/orders                → List user orders
POST    /api/orders                → Create order
GET     /api/orders/[id]           → Get order details
GET     /api/orders/[id]/delivery  → Get delivery status
PUT     /api/orders/[id]/delivery  → Update delivery status
```

### Middleware

```
app/
├── middleware.ts
│   ├── Language routing (i18n)
│   ├── Store context extraction
│   ├── Admin route protection
│   └── Rate limiting
```

---

## Payment Processing

### Payment Flow

```
Customer selects product & quantity
         │
         ▼
Checkout: Confirm address & shipping
         │
         ▼
Select payment method (4 options)
         │
         ├─── Card (Paymob)
         │       │
         │       ▼
         │    Redirect to Paymob iframe
         │       │
         │       ▼
         │    Customer enters card info
         │       │
         │       ▼
         │    Paymob processes payment
         │       │
         │       ▼
         │    Webhook: payment_webhook/paymob
         │       │
         │       ▼
         │    Update order.payment_status = 'paid'
         │
         ├─── Vodafone Cash
         │       │
         │       ▼
         │    Customer receives USSD/SMS
         │       │
         │       ▼
         │    Customer confirms PIN
         │       │
         │       ▼
         │    Vodafone confirms via webhook
         │       │
         │       ▼
         │    Update order status
         │
         ├─── InstaPay
         │       │
         │       ▼
         │    Customer confirms in app
         │       │
         │       ▼
         │    InstaPay processes
         │       │
         │       ▼
         │    Webhook confirmation
         │
         └─── WhatsApp (Manual)
                 │
                 ▼
              Admin confirms payment
                 │
                 ▼
              Update order status
```

### Payment State Machine

```
pending
  ├─(processing)→ processing
  │                   ├─(success)→ completed ✓
  │                   └─(fail)→ failed ✗
  │
  └─(timeout)→ expired
  
completed
  └─(refund requested)→ refunded
```

---

## Delivery System

### Delivery Lifecycle

```
Order created (payment_status = paid)
         │
         ▼
Status = 'processing' (items being prepared)
         │
         ▼
Status = 'ready_for_pickup' (waiting for driver)
         │
         ▼
Status = 'picked_up' (driver collected)
         │
         ▼
Status = 'in_transit' (on the way)
         │
         ▼
Status = 'delivered' ✓ (successfully delivered)
    OR
Status = 'delivery_failed' ✗ (couldn't deliver)
         │
         ▼
Retry or Status = 'returned' (back to store)
```

### GPS Tracking

```
Driver app sends location every 1-5 mins
         │
         ▼
Location stored in deliveries table
         │
         ▼
Customer can view live location on order page
         │
         ▼
ETA calculated based on current location & route
```

### Notification System

```
Delivery status changed
         │
         ├─(send email)→ SendGrid
         │
         ├─(send SMS)→ Twilio
         │
         └─(send in-app)→ Notification stored in DB
```

---

## Multi-Tenancy Design

### Store Isolation

Each store is completely isolated:

```
Store A                          Store B
├── Products (only visible      ├── Products (only visible
│   to Store A customers)       │   to Store B customers)
├── Orders (Store A only)       ├── Orders (Store B only)
├── Staff (Store A only)        ├── Staff (Store B only)
└── Financials (Store A only)   └── Financials (Store B only)
```

### Query Level Isolation

All queries include `store_id` filter:

```sql
SELECT * FROM products 
WHERE store_id = $1 AND is_published = true
```

### RLS Policy

```sql
CREATE POLICY "store_isolation" ON products
  FOR SELECT USING (store_id = current_store_id());
```

### Store Context

In middleware/context:
```typescript
// Extract store from subdomain or URL
const storeId = extractStoreId(request);

// Pass through request context
request.nextUrl.searchParams.set('store_id', storeId);
```

---

## Security Model

### Authentication Security

- Passwords hashed with bcrypt (via Supabase)
- JWT tokens with 1-hour expiry
- Refresh tokens stored in HTTP-only cookies
- CSRF protection via SameSite cookies

### Data Security

- Row Level Security (RLS) policies
- Encrypted passwords
- No sensitive data in logs
- API keys stored as secrets (env vars)

### API Security

- API authentication via JWT token
- Rate limiting (configured in middleware)
- Input validation on all endpoints
- SQL injection protection (parameterized queries)
- XSS protection (sanitized output)

### Payment Security

- PCI-DSS compliance (via Paymob)
- No card details stored locally
- Encrypted payment data
- Secure webhook verification
- Payment gateway API keys in secrets

### Infrastructure Security

- HTTPS only
- Security headers (CSP, X-Frame-Options, etc.)
- Regular dependency updates
- Sentry for error monitoring
- Activity logging in audit_logs table

---

## Scalability

### Horizontal Scaling

- Stateless API (multiple Vercel instances)
- Database connection pooling
- CDN for static assets
- Redis cache (optional)

### Vertical Optimization

- Database indexes on frequently queried columns
- Query optimization (eager loading, pagination)
- Lazy loading on frontend
- Image optimization (Vercel Image Optimization)
- Code splitting for faster page loads

### Performance Targets

- Page load: < 2 seconds
- API response: < 500ms
- Database query: < 100ms
- Search response: < 1 second

### Monitoring & Alerts

- Sentry: Error tracking
- PostHog: Analytics & feature flags
- Vercel Analytics: Core Web Vitals
- Database monitoring: Supabase dashboard

---

## Deployment Architecture

### Development Environment

```
localhost:3000
├── Frontend (Next.js dev server)
├── API routes
└── Supabase local (optional)
```

### Production Environment

```
yourdomain.com (Vercel)
├── Edge Functions (API routes)
├── Static assets (CDN)
├── Image optimization
└── Analytics
    │
    ├── Supabase (Database)
    ├── SendGrid (Email)
    ├── Twilio (SMS)
    ├── Sentry (Errors)
    └── PostHog (Analytics)
```

---

## Future Enhancements

- WebSocket for real-time order updates
- Redis caching for performance
- GraphQL API alongside REST
- Mobile apps (iOS/Android)
- Advanced analytics dashboard
- AI-powered recommendations
- Subscription products
- Marketplace features (multiple vendors)
