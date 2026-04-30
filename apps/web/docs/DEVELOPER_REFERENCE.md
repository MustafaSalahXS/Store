# Developer Reference Guide

Technical guide for developers working on the codebase.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Development Setup](#development-setup)
3. [Code Patterns](#code-patterns)
4. [Database Operations](#database-operations)
5. [Authentication](#authentication)
6. [API Endpoints](#api-endpoints)
7. [Custom Hooks](#custom-hooks)
8. [Error Handling](#error-handling)
9. [Testing](#testing)
10. [Contributing](#contributing)

---

## Project Structure

```
project-root/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles
│   ├── middleware.ts        # Request middleware
│   │
│   ├── (admin)/              # Admin routes group
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── dashboard/
│   │       ├── products/
│   │       ├── orders/
│   │       └── settings/
│   │
│   ├── (shop)/               # Customer routes group
│   │   ├── page.tsx         # Homepage
│   │   ├── products/
│   │   ├── [productSlug]/   # Dynamic product page
│   │   ├── cart/
│   │   └── checkout/
│   │
│   ├── (auth)/               # Auth routes group
│   │   ├── login/
│   │   ├── register/
│   │   └── verify-email/
│   │
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   └── verify-email/route.ts
│       ├── stores/
│       ├── products/
│       ├── orders/
│       ├── payments/
│       ├── deliveries/
│       └── webhooks/
│           ├── paymob/
│           ├── vodafone/
│           └── instapay/
│
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── forms/               # Form components
│   ├── products/            # Product-related
│   ├── orders/              # Order-related
│   ├── admin/               # Admin-specific
│   ├── layout/              # Layout components
│   └── common/              # Shared components
│
├── hooks/
│   ├── useAuth.ts          # Authentication hook
│   ├── useStore.ts         # Store context
│   ├── useFetch.ts         # Data fetching (SWR)
│   └── useNotification.ts  # Notifications
│
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── auth.ts             # Auth utilities
│   ├── api.ts              # API client
│   ├── db.ts               # Database queries
│   ├── payment.ts          # Payment utilities
│   └── utils.ts            # General utilities
│
├── types/
│   ├── index.ts            # Shared types
│   ├── user.ts             # User types
│   ├── store.ts            # Store types
│   ├── product.ts          # Product types
│   ├── order.ts            # Order types
│   └── payment.ts          # Payment types
│
├── utils/
│   ├── validation.ts       # Form/input validation
│   ├── formatting.ts       # Format utilities
│   ├── helpers.ts          # General helpers
│   └── constants.ts        # App constants
│
├── public/
│   ├── images/
│   ├── icons/
│   └── locales/            # i18n JSON files
│
├── docs/                   # Documentation
├── scripts/                # Database scripts
├── tests/                  # Test files
├── .env.example           # Example env vars
├── next.config.js         # Next.js config
├── tsconfig.json          # TypeScript config
├── tailwind.config.ts     # Tailwind config
└── package.json           # Dependencies
```

---

## Development Setup

### Prerequisites

```bash
# Node.js 18+
node --version

# pnpm
npm install -g pnpm
pnpm --version
```

### Clone & Install

```bash
git clone <repo>
cd project
pnpm install
```

### Environment Setup

```bash
# Copy example
cp .env.example .env.local

# Edit .env.local with your values
# Get from Supabase project
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Payment test keys (get from provider)
PAYMOB_API_KEY=test_...
# etc.
```

### Database Setup

```bash
# Run migrations
pnpm run db:migrate

# Seed with sample data
pnpm run db:seed

# Verify connection
pnpm run db:verify
```

### Start Development

```bash
pnpm dev

# Open http://localhost:3000
```

---

## Code Patterns

### Server Components vs Client Components

**Server Components (Default):**
```typescript
// app/products/page.tsx
import { ProductList } from '@/components/ProductList';

export default async function Page() {
  const products = await db.query('SELECT * FROM products');
  
  return (
    <main>
      <ProductList products={products} />
    </main>
  );
}
```

**Client Components (Interactive):**
```typescript
// components/ProductFilter.tsx
'use client';

import { useState } from 'react';

export function ProductFilter() {
  const [filters, setFilters] = useState({});
  
  return (
    <div>
      {/* Form that updates state */}
    </div>
  );
}
```

### Data Fetching (SWR)

```typescript
import useSWR from 'swr';

function ProductList() {
  const { data: products, isLoading, error } = useSWR(
    '/api/products',
    async (url) => {
      const res = await fetch(url);
      return res.json();
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

### Forms with Validation

```typescript
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    const result = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Handle result
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Login</button>
    </form>
  );
}
```

---

## Database Operations

### Query Patterns

**Using Supabase Client:**
```typescript
import { supabase } from '@/lib/supabase';

// Get single item
const { data: product } = await supabase
  .from('products')
  .select('*')
  .eq('id', productId)
  .single();

// Get list
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('store_id', storeId)
  .order('created_at', { ascending: false })
  .limit(10);

// Insert
const { data: newProduct, error } = await supabase
  .from('products')
  .insert([{
    name: 'Product',
    price: 100,
    store_id: storeId,
  }])
  .select()
  .single();

// Update
const { data: updated } = await supabase
  .from('products')
  .update({ name: 'Updated' })
  .eq('id', productId)
  .select()
  .single();

// Delete
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId);
```

**Complex Queries:**
```typescript
// Join tables
const { data } = await supabase
  .from('orders')
  .select(`
    *,
    user:users(*),
    items:order_items(*, product:products(*))
  `)
  .eq('store_id', storeId);

// Filter with conditions
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('store_id', storeId)
  .in('status', ['processing', 'shipped'])
  .gte('created_at', startDate)
  .lte('created_at', endDate);
```

---

## Authentication

### Auth Hook

```typescript
// lib/useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, login, logout };
}
```

### Protected Routes

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Check if admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
```

---

## API Endpoints

### Route Handler Pattern

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get('store_id');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .limit(limit);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create
    const { data, error } = await supabase
      .from('products')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Authentication in Routes

```typescript
// app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get user from request
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // User is authenticated
    const user = data.user;
    
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## Custom Hooks

### useStore Hook

```typescript
// hooks/useStore.ts
import { useContext, createContext } from 'react';

const StoreContext = createContext(null);

export function useStore() {
  const context = useContext(StoreContext);
  
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  
  return context;
}
```

### useNotification Hook

```typescript
// hooks/useNotification.ts
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function useNotification() {
  const { toast } = useToast();

  const notify = useCallback((message, type = 'info') => {
    toast({
      title: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  }, [toast]);

  return { notify };
}
```

---

## Error Handling

### API Error Response

```typescript
// lib/api.ts
export class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

export async function apiCall(endpoint, options = {}) {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new APIError(
      response.status,
      data.code || 'UNKNOWN_ERROR',
      data.message || 'An error occurred'
    );
  }

  return data;
}
```

### Error Boundary

```typescript
// components/ErrorBoundary.tsx
'use client';

import { useEffect } from 'react';

export function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

---

## Testing

### Setup Testing Environment

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

### Unit Test Example

```typescript
// lib/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatPrice } from '@/lib/utils';

describe('formatPrice', () => {
  it('formats price correctly', () => {
    expect(formatPrice(100)).toBe('$100.00');
    expect(formatPrice(1000.5)).toBe('$1,000.50');
  });
});
```

### Component Test Example

```typescript
// components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Run Tests

```bash
pnpm test                # Run all tests
pnpm test --watch      # Watch mode
pnpm test:coverage     # Coverage report
```

---

## Contributing

### Commit Messages

```bash
git commit -m "feat: add product filtering"
git commit -m "fix: payment webhook error"
git commit -m "docs: update API documentation"
git commit -m "refactor: simplify auth logic"
```

**Format:** `type(scope): description`

**Types:**
- feat: New feature
- fix: Bug fix
- docs: Documentation
- refactor: Code refactoring
- perf: Performance improvement
- test: Adding tests
- ci: CI/CD changes
- chore: Maintenance

### Code Style

```bash
pnpm lint              # Check linting
pnpm lint --fix       # Auto-fix issues
pnpm format           # Format with Prettier
```

### Type Checking

```bash
pnpm type-check       # Check TypeScript errors
```

### Build Verification

```bash
pnpm build            # Production build
```

---

## Debugging

### Enable Debug Mode

```bash
// In code
console.log('[DEBUG]', variableName);

// Or in browser console
localStorage.setItem('debug', 'true');
```

### Debug in VS Code

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Common Issues

| Problem | Solution |
|---------|----------|
| Port already in use | `pnpm dev -p 3001` |
| Database connection failed | Check `.env.local` Supabase URL |
| Module not found | Run `pnpm install` |
| TypeScript errors | Run `pnpm type-check` |
| Stale data in UI | Clear browser cache, restart dev server |

---

For more details, see other documentation files in the `/docs` directory.
