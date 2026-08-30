# Task 03: Checkout Live Order & Shipment Tracking Engine

## Overview
Upgrade the checkout experience so that once an order is created, the customer is presented with an interactive, real-time Live Order Concierge Dashboard. The dashboard reflects real-time status transitions (from pending admin approval to payment verification, packaging, out for delivery with live checkpoint locations, and final delivery).

## Objectives
- [ ] Implement `GET /api/orders/:id` in `apps/api/src/routes/orders.ts` returning:
  - Order details, payment status, items, and linked delivery records.
- [ ] Automatically create a `Delivery` record upon order placement with `currentStatus: 'pending'`.
- [ ] Build the `OrderTracker` component for the checkout post-submission view:
  - 5-Milestone Stepper:
    1. **Order Received** (Timestamp & Reference Code)
    2. **Payment & Verification** (Awaiting Admin Review badge / Instant for Cards)
    3. **Order Processing** (Warehouse Assembly)
    4. **In Transit / Out for Delivery** (Courier Name, Phone, Tracking Code & Live Location Checkpoint)
    5. **Delivered** (Confirmation)
- [ ] Implement smart client-side polling (every 4 seconds with pulse heartbeat).
- [ ] Add direct WhatsApp Concierge button with pre-formatted order summary and live query link.
- [ ] Enable one-click official PDF receipt download.

## Dependencies
- Depends on `Task 01: Brand & Design System Core` and `Task 02: Auth UI/UX Overhaul`.

## Deliverables
- `apps/api/src/routes/orders.ts` (`GET /api/orders/:id` endpoint and delivery auto-initialization).
- `apps/web/components/checkout/order-tracker.tsx`
- `apps/web/app/checkout/page.tsx` (Integrated post-order tracking view).
- `apps/web/lib/api.ts` (`api.orders.get(id)` function).
