# Timeless Templates - Setup Guide

A premium wedding template marketplace built with Next.js, Tailwind CSS, and Supabase. Designed to feel like a $50+ SaaS product with premium aesthetics, excellent visual hierarchy, and conversion optimization.

## Features

- **Premium Design System**: Elegant color palette (cream, gold, blush), Playfair Display serif font, generous whitespace
- **Landing Page**: Hero section with hero section with trust signals, product showcase, bundle offer, social proof, and CTAs
- **Product Detail Pages**: High-conversion product pages with features, pricing, what's included, and related products
- **Admin Dashboard**: Manage products with full CRUD operations - add, edit, delete products
- **Success Page**: Post-purchase confirmation with next steps and onboarding guidance
- **Multi-Tenant Support**: Query parameter filtering for store-specific products (`?store=storeId`)
- **Responsive Design**: Mobile-first, beautiful on all devices
- **Conversion Optimized**: Clear hierarchy, high-contrast buttons, urgency signals, social proof

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 with custom design tokens
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd timeless-templates
npm install
# or
pnpm install
```

### 2. Setup Supabase Database

#### Option A: Auto-setup with CLI
If you have the Supabase CLI installed:
```bash
supabase start
```

#### Option B: Manual Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the SQL from `/scripts/init-supabase.sql`
3. This creates the `products` table with sample data

### 3. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STORE_ID=default_store  # Optional: for multi-tenant filtering
```

Get these values from your Supabase project settings:
- Go to Settings → API → Project URL (NEXT_PUBLIC_SUPABASE_URL)
- Go to Settings → API → Project API Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 4. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Project Structure

```
/app
  /admin          # Admin dashboard - product management
  /product/[id]   # Product detail pages
  /success        # Purchase success page
  page.tsx        # Landing page with hero & products
  layout.tsx      # Root layout
  globals.css     # Design system & Tailwind setup

/components
  header.tsx      # Sticky navigation header
  product-card.tsx # Product card component

/lib
  supabase.ts     # Supabase client initialization
  products.ts     # Database functions for products

/scripts
  init-supabase.sql # Database schema & sample data

/public
  # Static assets

tailwind.config.ts  # Tailwind configuration
```

## Key Pages

### Landing Page (`/`)
- Hero section with compelling headline
- 3-product grid showcase
- Bundle offer with savings badge
- Social proof / testimonials section
- Multiple CTAs throughout
- Premium footer

**Design Focus**: Hero copywriting, visual hierarchy, urgency signals

### Product Detail (`/product/[id]`)
- Large product image with sticky positioning
- Clear pricing and value proposition
- Key features list with checkmarks
- "What's Included" section in highlighted box
- Quantity selector
- High-contrast "Get Template" CTA
- Trust badges (instant download, returns, lifetime access)
- Related products carousel
- Social proof with ratings

**Design Focus**: High conversion rates, trust-building, clear benefit communication

### Admin Dashboard (`/admin`)
- Product statistics (total, revenue, average price)
- Products table with edit/delete actions
- Modal form for adding/editing products
- Real-time product management

**Design Focus**: Clean, functional admin interface with clear action buttons

## Customization

### Colors
Edit the color palette in `/app/globals.css`:

```css
:root {
  /* Primary: Gold */
  --primary: 42 95% 55%;
  /* Secondary: Blush Pink */
  --secondary: 5 70% 88%;
  /* Background: Cream */
  --background: 60 30% 97%;
}
```

### Typography
- Headings use "Playfair Display" (serif)
- Body uses "Geist" (sans-serif)
- Change fonts in `/app/globals.css` and `tailwind.config.ts`

### Product Images
Replace image URLs in:
- Landing page mock data
- Product detail pages
- Admin dashboard

### Content
Update product names, descriptions, prices in:
- Landing page `/app/page.tsx`
- Product detail page `/app/product/[id]/page.tsx`
- Database via Admin Dashboard

## Integration Points

### Payment Processing
The success page is ready to integrate with:
- **Paymob**: Add checkout button linking to Paymob payment links
- **Stripe**: Integrate Stripe Checkout
- **Custom Payment**: Replace "Download Now" button with your payment provider

Add payment processing to:
- `POST /api/checkout` (create checkout session)
- Success page redirect with order ID

### Email
Send download links via email after purchase:
- Send from `/api/success` endpoint
- Use SendGrid, Resend, or similar service
- Include setup guide and support links

### Analytics
Track conversions:
- Vercel Analytics (built-in via `Analytics` component)
- PostHog events for funnel analysis
- Add `<Analytics />` to track pageviews

## Multi-Tenant Support

To support multiple stores/vendors:

1. **URL Parameter Filtering**: Already implemented
   - Link format: `/?store=store-123`
   - Automatically filters products by `store_id`

2. **Database Setup**:
   - Products have optional `store_id` field
   - Query by store ID in `/lib/products.ts`

3. **Admin Isolation** (Optional):
   - Add authentication to admin dashboard
   - Only show products for authenticated store
   - Implement Supabase RLS policies

## Database Schema

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT NOT NULL,
  description TEXT,
  download_url TEXT,
  store_id TEXT,          -- For multi-tenant filtering
  category TEXT,          -- Ceremony, Reception, Stationery, Bundle
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Performance Optimization

- Images use Next.js `Image` component with optimization
- CSS-in-JS via Tailwind reduces bundle size
- Dark mode support (ready in CSS)
- Responsive images with `sizes` attribute
- Font optimization via Next.js font system

## Security Considerations

- Admin page has no auth (add with Supabase Auth or custom)
- Product data is public (change via RLS policies)
- Payment processing should use server-side verification
- Environment variables for sensitive data

## Deployment

### Vercel (Recommended)
```bash
git push origin main
```
Vercel will auto-deploy on push. Configure environment variables in project settings.

### Other Platforms
```bash
npm run build
npm start
```

Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.

## Troubleshooting

**Products not loading?**
- Check Supabase credentials in `.env.local`
- Verify database table exists: `SELECT * FROM products;`
- Check browser console for errors

**Images not showing?**
- Verify image URLs are accessible
- Check CORS if using external images
- Next.js Image optimization requires valid URLs

**Styling looks off?**
- Clear `.next` folder and rebuild: `rm -rf .next && npm run dev`
- Check Tailwind CSS is processing correctly
- Ensure globals.css is imported in layout.tsx

## Next Steps

1. **Add Real Products**: Replace mock data with your templates
2. **Setup Payment**: Integrate Paymob, Stripe, or payment provider
3. **Add Authentication**: Use Supabase Auth for admin dashboard
4. **Deploy**: Push to Vercel or your hosting platform
5. **Setup Email**: Send download links and onboarding
6. **Monitor**: Add analytics to track conversions

## Support

For questions or issues:
- Check Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs
- Tailwind CSS docs: https://tailwindcss.com/docs

## License

MIT License - use freely for your wedding template business!
