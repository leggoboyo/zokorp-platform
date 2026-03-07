# Repo Hardening Backlog

Source of truth for repository hardening tasks and run-by-run verification.

## Priority Checklist
- [x] Fix callbackUrl open redirects on login/register.
- [x] Replace request-driven architecture-review processing with a durable worker or queue model.
- [ ] Decouple public pages from auth-driven dynamic rendering.
- [ ] Make typecheck independent from `.next` artifacts.
- [ ] Move CSP to `Content-Security-Policy-Report-Only` first and align GA and Stripe domains while removing `unsafe-inline` and `unsafe-eval` where possible.
- [ ] Block placeholder Stripe prices and dead checkout states.
- [ ] Replace in-memory rate limiting with a shared store.
- [ ] Remove silent catalog and account fallbacks that hide failures.
- [ ] Make sitemap deterministic.
- [ ] Split `/software/[slug]` central dispatch into per-tool routes with a manifest-driven catalog.
- [ ] Extract large tool forms into feature-local sections.
- [ ] Add active nav state.
- [ ] Add field-level accessibility and consistent loading and error states.
- [ ] Add request IDs and safe error envelopes to all API routes.
- [ ] Add route tests for auth, billing, service requests, validator, landing-zone, and architecture-review endpoints.
- [ ] Add browser smoke tests for login, software, services, and one tool flow.
- [ ] Wire in central env validation and remove dead env code.
- [ ] Stop reusing `ARCH_REVIEW_EML_SECRET` as the auth secret.
- [ ] Harden Stripe customer creation and webhook idempotency.

## Run Log
### 2026-03-07
- Completed: `fix callbackUrl open redirects on login/register`.
- Scope: added shared callback URL sanitizer, wired login/register pages to it, and added NextAuth redirect callback enforcement.
- Verification:
  - `npm run lint` ✅
  - `npm run typecheck` ✅
  - `npm test` ✅
  - `npm run build` ✅

### 2026-03-07 (run 2)
- Completed: `replace request-driven architecture-review processing with a durable worker or queue model`.
- Scope: removed request-triggered architecture-review processing from submit/status routes, added a secured queue-drain worker endpoint (`/api/architecture-review/worker`) with batch limits, added queue drain support in `lib/architecture-review/jobs.ts`, and scheduled the worker via `vercel.json` cron.
- Verification:
  - `npm run lint` ✅
  - `npm run typecheck` ❌ (`.next/types/validator.ts` route type mismatches; Prisma client missing `cloudCostLeakFinderSubmission` in typecheck context)
  - `npm test` ✅
  - `npm run build` ❌ (same Prisma/typecheck issue in `app/api/submit-cloud-cost-leak-finder/route.ts`)
