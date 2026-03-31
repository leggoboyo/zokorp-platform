# Launch Gate / Go-No-Go

Date: 2026-03-25 (updated 2026-03-30)

## Decision Summary

| Launch surface | Decision | Why |
| --- | --- | --- |
| Founder-led testing on `app.zokorp.com` | GO | The core app is live, hardened, deployed, and re-smoked successfully |
| Direct demos / invite-only soft launch to `app.zokorp.com` | GO | Monitored inbox proof, real `/services` booking proof, and signed-in ops proof are all complete |
| Broad marketing using `zokorp.com` / `www.zokorp.com` | NO-GO | Root-domain DNS still needs cutover into Vercel and canonical redirect behavior |
| Broad promotion of paid validator flow | GO WITH CAVEATS | Consumption proof is real, but one non-admin purchase-plus-consumption artifact would still strengthen broader launch confidence |
| Broad promotion of booked-call automation from `/services` | GO | One real external Calendly booking was created and matched back into ZoKorp records |

## Gate Checklist

### Green now

- `app.zokorp.com` production deployment is healthy after deploy `dpl_Eb6KoHxjki6AafqCBC7A53vyWJLU`
- `npm run lint` passed
- `npm run typecheck -- --incremental false` passed
- `npm test` passed on the current mainline branch
- `npm run build` passed
- production smoke passed against `https://app.zokorp.com`
- `/services` primary CTA now uses the tagged Calendly URL strategy live
- `/services` request copy is now honest about immediate request creation vs later booked-call sync
- `/services` signed-in first-paint behavior is fixed in code and covered by tests
- `/services` post-submit success state is now browser-proven live, with form hiding and working account navigation
- monitored inbox proof is complete for `consulting@zokorp.com`
- one real external Calendly booking is complete and linked back into production records
- signed-in soft-launch operational proof is repeatable from CLI
- validator credit consumption no longer fails after post-run bookkeeping issues
- Stripe checkout/portal session creation no longer fails if audit logging fails
- browser-completed Stripe Checkout is proven in test mode
- admin pages now have a real forbidden boundary in code
- architecture-review status responses are fully `no-store`
- Calendly webhook signature freshness is enforced
- XLSX ingestion abuse surface is reduced with ZIP preflight and workbook limits
- WorkDrive archive failure states now surface in admin leads ops workflows
- runtime readiness now clearly distinguishes internal runtime config from external scheduler verification

### Yellow now

- root-domain DNS still needs cutover into Vercel
- founder bio/headshot and first approved proof asset are still placeholders
- public pricing, refund, and legal posture still need final owner approval before broad promotion
- one non-admin purchase-plus-consumption artifact for the paid validator flow would tighten broader launch confidence
- CSP remains broader than ideal
- WorkDrive provider capability is still unresolved even though the operator visibility issue is fixed

### Red now

- `zokorp.com` / `www.zokorp.com` are still not aligned with the real platform

## Shortest Path To Full Public-Launch Readiness

1. Update DNS so both:
   - `zokorp.com`
   - `www.zokorp.com`
   point to Vercel, then verify the redirect into `https://app.zokorp.com`.
2. Complete one non-admin paid-validator purchase-plus-consumption proof.
3. Replace placeholder founder/proof content or explicitly approve keeping placeholder mode for the soft launch only.
4. Approve final public pricing, refund, and legal wording before broader promotion.

## Recommended Launch Posture Right Now

Use this order:

1. Send trusted people directly to `https://app.zokorp.com`.
2. Use the repaired `/services` flow and direct software-tool links for founder-led outreach.
3. Do not market the root domain publicly until the DNS cutover is complete.
4. Do not switch from soft launch to broad launch until pricing/legal/asset approvals are finished.
