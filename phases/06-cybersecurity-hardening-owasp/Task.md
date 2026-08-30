# Task 06: Cybersecurity, OWASP Defense & API Hardening

## Overview
Harden the entire platform against OWASP Top 10 vulnerabilities, ensuring enterprise-grade data protection, rate limiting, secure HTTP headers, sanitization, and strict access controls.

## Objectives
- [ ] Install and configure `express-rate-limit` on API routes:
  - Auth rate limiter: Max 10 requests per 15 minutes for `/api/auth/*`.
  - Order creation limiter: Max 20 requests per 15 minutes for `/api/orders`.
- [ ] Configure `helmet` middleware for standard HTTP security headers:
  - Content Security Policy (CSP)
  - HTTP Strict Transport Security (HSTS)
  - X-Frame-Options: SAMEORIGIN (prevents clickjacking)
  - X-Content-Type-Options: nosniff
- [ ] Enforce Zod payload validation on all POST/PUT/PATCH endpoints.
- [ ] Enforce strict CORS whitelist matching configured store domains and Vercel deployments.
- [ ] Sanitize user text inputs to prevent stored XSS attacks.
- [ ] Audit Supabase Row Level Security (RLS) policies for direct client queries.

## Dependencies
- Depends on `Task 02: Auth UI/UX Overhaul`, `Task 03: Checkout Live Tracking`, and `Task 04: Admin Approval`.

## Deliverables
- `apps/api/src/index.ts` (Rate limiters, helmet, CORS hardening).
- `apps/api/src/middleware/security.ts`
- Security test scripts verifying rate limits and header defenses.
