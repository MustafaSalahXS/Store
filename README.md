# Store (Monorepo)

A full-stack, multi-store e-commerce platform built with Turborepo, Next.js, Express, and Prisma.

## Architecture

This monorepo consists of:
- **`apps/web`**: Next.js 14+ frontend featuring modern storefront, customer checkout, delivery tracking, and administrative dashboard.
- **`apps/api`**: Node.js & Express REST API with Prisma ORM, handling authentication, products, orders, coupons, and payment webhooks.
- **`packages/database`**: Shared Prisma schema, migrations, and database client.

## Tech Stack

- **Framework**: Turborepo, Next.js, Express.js
- **Database & ORM**: PostgreSQL / Supabase, Prisma ORM
- **Styling**: Tailwind CSS, Lucide Icons
- **Package Manager**: pnpm

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create environment configuration based on `.env.example`:

```bash
cp .env.example .env.local
```

### 3. Database Setup

```bash
pnpm db:generate
pnpm db:push
```

### 4. Run Development Servers

```bash
# Start all apps
pnpm dev

# Or start specific apps
pnpm dev:web
pnpm dev:api
```

## Deployment (Vercel)

1. Connect this repository to your Vercel account or team.
2. Ensure the required environment variables from `.env.example` are set in the Vercel Project Settings.
3. Configure the build command (`turbo run build`) and output directory according to your app target (`apps/web` or `apps/api`).

## Documentation

Detailed documentation guides are available in [`apps/web/docs`](./apps/web/docs):
- [Backend Setup](./apps/web/docs/BACKEND_SETUP.md)
- [Deployment Guide](./apps/web/docs/DEPLOYMENT.md)
- [Admin Guide](./apps/web/docs/ADMIN_GUIDE.md)
- [Customer Guide](./apps/web/docs/CUSTOMER_GUIDE.md)
- [Delivery Guide](./apps/web/docs/DELIVERY_GUIDE.md)
