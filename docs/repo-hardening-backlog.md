# Repo Hardening Backlog

Source of truth for recurring hardening work. Items are ordered by priority.

## Backlog
- [x] Fix callbackUrl open redirects on login/register.
- [ ] Replace request-driven architecture-review processing with a durable worker or queue model.
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

## Implementation Notes
### 2026-03-08
- Completed: `Fix callbackUrl open redirects on login/register`.
- Hardened [`/Users/zohaibkhawaja/Documents/Codex/zokorp-platform/lib/callback-url.ts`](/Users/zohaibkhawaja/Documents/Codex/zokorp-platform/lib/callback-url.ts) to reject encoded redirect vectors, backslashes, control characters, and to normalize internal paths.
- Added `sanitizeAuthRedirectTarget` and wired it into NextAuth redirect handling in [`/Users/zohaibkhawaja/Documents/Codex/zokorp-platform/lib/auth.ts`](/Users/zohaibkhawaja/Documents/Codex/zokorp-platform/lib/auth.ts).
- Expanded tests in [`/Users/zohaibkhawaja/Documents/Codex/zokorp-platform/tests/callback-url.test.ts`](/Users/zohaibkhawaja/Documents/Codex/zokorp-platform/tests/callback-url.test.ts) for encoded attack patterns and cross-origin redirect rejection.

## Verification Results
### 2026-03-08
- Preflight path: fallback (missing `scripts/network-preflight.sh`).
- Git remote reachability: failed (`github.com` DNS resolution failed in this environment).
- npm registry reachability: failed (environment DNS/network restriction).
- `npm run lint`: pass
- `npm run typecheck`: pass
- `npm test`: pass
- `npm run build`: fail
  - Exact failure: `next/font` could not fetch Google Fonts (`JetBrains Mono`, `Plus Jakarta Sans`, `Space Grotesk`) because outbound network access is unavailable.
