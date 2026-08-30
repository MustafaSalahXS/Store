# Task 02: Authentication & Identity UI/UX Overhaul

## Overview
Re-engineer the Login and Signup flows into an editorial split-screen experience matching the store's luxury minimalist aesthetics, providing seamless tab switching, password security metrics, social authentication, and guest checkout options.

## Objectives
- [ ] Build high-fashion split-screen layout for `/login` and `/register`:
  - Left showcase panel featuring brand lookbook photography, editorial statement, and subtle grain.
  - Right auth panel with zero-reload tab switching between "Sign In" and "Create Account".
- [ ] Add password visibility toggle (eye icon) with clean micro-animations.
- [ ] Implement interactive password strength meter on registration (length, complexity, visual progress bar).
- [ ] Integrate Google Social Sign-In option with minimalist styling.
- [ ] Add "Continue as Guest" option to prevent checkout abandonment.
- [ ] Ensure seamless auto-login on signup and immediate redirect back to `/checkout` or `/admin`.

## Dependencies
- Depends on `Task 01: Brand & Design System Core`.

## Deliverables
- `apps/web/app/login/page.tsx`
- `apps/web/app/register/page.tsx`
- `apps/web/components/auth/login-form.tsx`
- `apps/web/components/auth/register-form.tsx`
- `apps/web/components/auth/password-strength.tsx`
