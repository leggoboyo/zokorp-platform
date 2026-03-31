# Launch Readiness Audit Summary

Date: March 25, 2026 (updated March 30, 2026)  
Primary production app: [https://app.zokorp.com](https://app.zokorp.com)

## Verdict

ZoKorp is ready for a founder-led soft launch on `app.zokorp.com`, but it is **not ready for broad public marketing yet**.

The remaining blockers are now concentrated in launch infrastructure, commercial approval, and public credibility assets rather than core platform plumbing:

- `zokorp.com` and `www.zokorp.com` still need DNS cutover into Vercel.
- final public pricing, refund, support, and legal wording still need owner approval for broader promotion.
- founder bio/headshot and the first approved proof asset are still placeholders.
- one non-admin paid purchase-plus-consumption artifact would still strengthen the public commercial story.

## What Is Proved Now

- `npm run ops:audit:production` passes against `https://app.zokorp.com`
- `npm run journey:audit:production` passes with signed-in browser flow
- `npm run soft-launch:audit:production` passes, including:
  - non-admin validator credit consumption
  - account-linked history
  - booked-call linkage proof
- monitored inbox delivery is confirmed for `consulting@zokorp.com`
  - validator result email arrived in Inbox
  - password reset email arrived in Inbox
- one real founder-controlled `/services` booking is confirmed end to end
  - Calendly booking created from the tagged CTA
  - matching `LeadInteraction`
  - matching `ServiceRequest`
  - matching ingest audit record

## What Still Blocks Broad Launch

### 1. Root-domain cutover

The real platform is live on `app.zokorp.com`, but `zokorp.com` and `www.zokorp.com` are not yet serving the audited app. The next infrastructure milestone is to point the root domain at Vercel and let the application redirect apex and `www` traffic into `https://app.zokorp.com`.

### 2. Commercial and policy approval

The public copy is now internally consistent, but broader launch still needs owner approval for:

- final public pricing
- final refund wording
- final support posture
- final legal wording

### 3. Founder and proof assets

The site now explicitly carries placeholder slots for:

- founder bio/headshot
- first approved proof asset or named case study

That is acceptable for a soft launch, but not ideal for broader promotion.

## Recommended Launch Stance

### Safe now

- Founder demos on `https://app.zokorp.com`
- Direct outbound links sent to `https://app.zokorp.com`
- Controlled invite-only soft launch to the app subdomain
- Public sharing of free tools and services pages when the link goes directly to `app.zokorp.com`
- Public sharing of booked-call automation and monitored result-email delivery as part of the soft-launch story

### Do not do yet

- Broad marketing to `zokorp.com`
- Broad marketing to `www.zokorp.com`
- Broad launch before policy approvals and founder/proof assets are finalized

## Shortest Path To Safe Public Marketing

1. Cut `zokorp.com` and `www.zokorp.com` to Vercel and verify root-domain redirect behavior.
2. Complete one non-admin paid-validator purchase-plus-consumption artifact.
3. Supply founder bio/headshot and the first approved proof asset, or explicitly keep placeholder mode for soft launch only.
4. Approve final pricing, refund, support, and legal wording for broader promotion.

## Audit Artifacts

- Soft-launch operational evidence:
  - `docs/soft-launch-operational-evidence.md`
- Public launch contract:
  - `docs/public-launch-decision-source-of-truth.md`
- Repeatable audits:
  - `npm run ops:audit:production`
  - `npm run journey:audit:production`
  - `npm run soft-launch:audit:production`
