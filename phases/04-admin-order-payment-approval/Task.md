# Task 04: Admin Order & Payment Approval Workflow

## Overview
Empower store administrators with an intuitive control interface to review customer payment proofs, approve orders with a single click, assign deliveries to couriers, set tracking numbers, and update shipment locations in real-time.

## Objectives
- [ ] Add dedicated admin endpoints:
  - `PATCH /api/admin/orders/:id/approve`: Set `orderStatus = "approved"` and `paymentStatus = "paid"`.
  - `PATCH /api/admin/orders/:id/dispatch`: Set `orderStatus = "shipped"`, update `Delivery.currentStatus = "in_transit"`, update tracking number, and append location notes.
- [ ] Upgrade the Admin Orders table at `apps/web/app/admin/orders/page.tsx`:
  - Quick action buttons: **Approve Payment**, **Approve Order**, **Dispatch Package**.
  - Modal to input current shipment location (e.g. *"Dispatched from Logistics Hub 1"*).
  - Courier assignment selector.
- [ ] Ensure that whenever an admin updates the status or location, the customer's checkout tracking dashboard updates on the next polling cycle.

## Dependencies
- Depends on `Task 03: Checkout Live Order Tracking`.

## Deliverables
- `apps/api/src/routes/admin.ts` (Approval and dispatch routes).
- `apps/web/app/admin/orders/page.tsx` (Enhanced action controls and modal).
