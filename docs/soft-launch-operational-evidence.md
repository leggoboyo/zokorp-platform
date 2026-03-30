# Soft-Launch Operational Evidence

## Current posture
- Launch mode: founder-led soft launch
- Public proof mode: representative/anonymized only
- Goal: keep operational proof repeatable and honest before broad promotion

## Repeatable production checks
- Provider and infrastructure audit:
  - `npm run ops:audit:production`
- Live signed-in browser journey:
  - `npm run journey:audit:production`
- Soft-launch operational proof:
  - `npm run ops:proof:production`

## What `ops:proof:production` verifies
- A dedicated non-admin audit account can sign in to production
- The audit account holds a real `FTR` credit for `ZoKorpValidator`
- One real `FTR` validator run succeeds against production
- The `FTR` credit balance decrements by exactly one
- The validator run lands in account-linked history with delivery state metadata
- A synthetic booked-call event creates a linked `ServiceRequest` and account/admin artifact
- The script attempts the internal Calendly ingest route first and records if local verification falls back to direct linkage proof

## Evidence output
- JSON summary:
  - `output/playwright/production-operational-proof/summary.json`
- Browser screenshots:
  - `output/playwright/production-operational-proof/*.png`

## Important caveats
- The booked-call proof is synthetic at the provider boundary. It proves linkage and operator visibility, not a human-created external Calendly booking.
- The validator proof checks recorded email-delivery state. It is stronger than a config-only check, but it is not the same as verifying a real monitored inbox.
- Before broad launch, the stronger external proofs are still:
  - one real founder-controlled Calendly booking observed end to end
  - one real monitored business inbox receiving customer-facing tool output

## Last verified state
- This repo now carries the automation needed to produce repeatable soft-launch evidence without relying on memory or one-off manual screenshots.
