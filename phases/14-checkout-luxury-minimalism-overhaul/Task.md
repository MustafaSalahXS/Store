# Task 14: Luxury Atelier Checkout UI/UX Overhaul & E-Commerce Core

## Overview
Redesign and upgrade the checkout experience at `http://localhost:3000/checkout` to align with the store's signature **Minimalist Luxury Atelier Design System** (Bodoni typography, warm ivory/stone palette, gold accents, and Ramis Arabic font). Replace outdated SaaS placeholders with authentic luxury fashion guarantees, introduce delivery address & destination details, live order status progression (from pending admin approval to courier delivery), diverse payment options (Paymob, InstaPay, Mobile Wallets, Cash on Delivery, WhatsApp), coupon code deductions, and bilingual RTL support.

## Objectives
- [x] **Design System Alignment**: Apply warm ivory (`#FAFAF9` / `#FFFFFF`) and stone palette with Bodoni & Jost typography, replacing SaaS terms with luxury atelier guarantees.
- [x] **Complete Shipping Destination**: Add full address fields (Street Address, Apartment/Suite, City/Governorate, Courier Delivery Notes) with auto-fill from user profile.
- [x] **Itemized Sartorial Summary**: Display garment images, selected sizes, color swatches/names, quantity multipliers, tax, shipping, and coupon discounts.
- [x] **Multi-Channel Payment Methods**:
  - Credit/Debit Card (Visa / Mastercard via Paymob portal)
  - InstaPay (1-click copy of official IPA/wallet and transfer instructions)
  - Mobile Wallets (Vodafone Cash, Orange Cash, Etisalat Cash)
  - Cash on Delivery (COD) / Concierge Payment on Delivery
  - WhatsApp Private Stylist / Atelier Concierge Checkout
- [x] **Post-Order Real-Time Status Tracking**:
  - Live 5-milestone progression tracking (Pending Admin Approval ➔ Approved & Staged ➔ Tailoring & Packaging ➔ Out for Delivery with Live Checkpoint ➔ Delivered)
  - 3.5s pulse heartbeat polling
  - One-click Official PDF Receipt download with store branding
- [x] **Full Arabic & RTL Experience**: Complete Arabic localization, right-to-left alignment, mirrored icons, and `Ramis Arabic` typography.
- [x] **Mobile-First Responsiveness**: Ensure 100% fluid mobile experience with touch-optimized controls and sticky order summary.

## Dependencies
- Depends on `Task 01: Brand & Design System Core` and `Task 03: Checkout Live Order Tracking`.

## Deliverables
- `apps/web/app/checkout/page.tsx` (Complete redesign)
- `apps/web/components/checkout/order-tracker.tsx` (Ivory atelier styling & RTL translation)
- `apps/web/lib/i18n-dictionary.ts` (Arabic checkout dictionary terms)
- `phases/14-checkout-luxury-minimalism-overhaul/Task.md`
- `phases/Tasks.md` (Updated master dependency graph)
