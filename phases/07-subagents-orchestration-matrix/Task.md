# Task 07: 30-Subagent Autonomous Orchestration Matrix

## Overview
Defines the squad breakdown, specific mandates, and collaboration protocol for the 30 specialized subagents driving the autonomous development and validation of the platform upgrade.

---

## 🏛️ Squad Breakdown & Roles

### Squad 1: Brand & UI/UX Design System (5 Agents)
1. **Brand Design Director**: Enforces luxury minimalism aesthetics and lookbook mood.
2. **Editorial Typography Specialist**: Manages `Bodoni Moda` and `Jost` hierarchies and scaling.
3. **Motion & Interaction Lead**: Tunes Framer Motion physics, spring dampening, and entry reveals.
4. **Design System Component Architect**: Builds accessible primitives (`LuxuryButton`, `LuxuryInput`).
5. **Mobile & Accessibility Auditor**: Validates WCAG AAA contrast ratios, touch targets (48px+), and responsiveness.

### Squad 2: Frontend & Customer Checkout (5 Agents)
6. **Auth Flow Lead**: Re-architects `/login` and `/register` split-screen layouts.
7. **Checkout Experience Engineer**: Coordinates step navigation, coupon calculation, and grand totals.
8. **Live Tracking UI Architect**: Builds the 5-stage milestone stepper and pulse heartbeat.
9. **Lookbook & Product Gallery Dev**: Enhances product zoom, thumbnail carousels, and quick views.
10. **Cart & Navigation Engineer**: Optimizes cart drawer, sticky checkout bar, and quick-add actions.

### Squad 3: Backend & API Services (5 Agents)
11. **API Gateway & Routing Lead**: Manages Express routing, middleware pipelines, and error boundaries.
12. **Database & Prisma Architect**: Optimizes PostgreSQL queries, index coverage, and relations.
13. **Supabase Auth Sync Engineer**: Maintains Just-In-Time user provisioning and session bridging.
14. **Payment Gateway Specialist**: Handles Paymob, Stripe, and webhook idempotency.
15. **Polling & Push Notification Lead**: Implements smart polling contracts and delivery updates.

### Squad 4: Admin & Delivery Fulfillment (5 Agents)
16. **Admin Order Workflow Specialist**: Implements one-click payment and order approval actions.
17. **Dispatch & Courier Manager**: Manages delivery assignment, tracking code generation, and routes.
18. **Inventory & Stock Automation Dev**: Decrements stock upon order approval and tracks low inventory.
19. **Financial & Analytics Lead**: Builds revenue, tax, and delivery performance metrics.
20. **Receipt & Invoice PDF Engine Specialist**: Generates crisp, branded downloadable PDF receipts.

### Squad 5: Cybersecurity & DevSecOps (5 Agents)
21. **OWASP Top 10 Security Auditor**: Conducts automated vulnerability analysis and threat modeling.
22. **Rate Limiting & DoS Shield Lead**: Sets up burst and window rate limits on critical endpoints.
23. **Input Sanitization & Zod Validator**: Enforces strict schemas and prevents script injection.
24. **CORS & HTTP Headers Hardener**: Configures Helmet, HSTS, CSP, and origin validation.
25. **Secrets & Token Security Specialist**: Audits environment variables, JWT life cycles, and key rotation.

### Squad 6: Quality Assurance & Performance (5 Agents)
26. **Jest Unit Test Architect**: Writes unit test suites for auth, orders, and delivery services.
27. **E2E Journey Tester**: Automates end-to-end user checkout and order tracking flows.
28. **Core Web Vitals & LCP Optimizer**: Minifies bundle size, optimizes AVIF images, and speeds LCP.
29. **Cross-Browser & Device QA Engineer**: Tests Safari, Chrome, Firefox, iOS, and Android viewports.
30. **Release & Documentation Manager**: Keeps `Tasks.md`, `MEMORY.md`, and changelogs up to date.
