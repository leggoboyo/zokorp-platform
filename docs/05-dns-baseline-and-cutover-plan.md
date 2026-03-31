# DNS baseline + cutover plan for zokorp.com

## Safety status
- No DNS changes were made to apex (`@`) or `www` in this session.
- `app.zokorp.com` is live on Vercel.
- `zokorp.com` and `www.zokorp.com` are attached to Vercel project `zokorp-web`, but DNS still points at Squarespace.

## Collection metadata
- Last refreshed: 2026-03-02 (America/Chicago)
- Evidence sources:
  - Live DNS lookups (`dig`)
  - WHOIS registrar lookup
  - Live HTTP header checks (`curl -I`)
  - Squarespace dashboard DNS screenshots are still pending login

## Current domain ownership and host roles
- Registrar (WHOIS): `Squarespace Domains LLC`
- Nameservers (authoritative NS):
  - `ns-cloud-a1.googledomains.com`
  - `ns-cloud-a2.googledomains.com`
  - `ns-cloud-a3.googledomains.com`
  - `ns-cloud-a4.googledomains.com`
- Current web hosting target: Squarespace (A/CNAME records)
- Current apex redirect behavior:
  - `https://zokorp.com` -> `301` to `https://www.zokorp.com/`
- Canonical domain target for migration:
  - `https://app.zokorp.com`

## Baseline DNS records (current)

### Core web records
- `@` — A — `198.49.23.144`
- `@` — AAAA — _(none returned)_
- `www` — CNAME — `ext-sq.squarespace.com.`
- `app` — A — _(none returned; currently unconfigured)_
- `_domainconnect` — CNAME — `_domainconnect.domains.squarespace.com.`

### Email records (Zoho) — do not touch
- `@` — MX — `10 mx.zoho.com.`
- `@` — MX — `20 mx2.zoho.com.`
- `@` — MX — `50 mx3.zoho.com.`
- `@` — TXT (SPF) — `v=spf1 include:zohomail.com ~all`
- `zmail._domainkey` — TXT (DKIM) — `v=DKIM1; k=rsa; p=...`
- `_dmarc` — TXT (DMARC) — `v=DMARC1; p=none; rua=mailto:zkhawaja@zokorp.com; ruf=mailto:consulting@zokorp.com; sp=none; adkim=r; aspf=r`
- `@` — TXT (Zoho verification) — `zoho-verification=zb91705876.zmverify.zoho.com`

### Verification and platform TXT records — preserve
- `@` — TXT — `MS=ms48124988`
- `@` — TXT — `openai-domain-verification=dv-pFy3RLJc868pTzB6FNcX7KLc`
- `@` — TXT — `openai-domain-verification=dv-s9qEgJwYskKoIaaA6Q0L4bIv`

## Records that must not be touched during cutover
- All MX records
- SPF/DKIM/DMARC TXT records
- Existing verification TXT records for Microsoft/OpenAI/Zoho
- Any unrelated CNAME/TXT records not explicitly required for Vercel domain connection
- Existing web records for `@` and `www` while rolling out `app.zokorp.com`

## Current Vercel-side domain setup
- `app.zokorp.com`: added to project and live
- `zokorp.com`: added to project, DNS pending
- `www.zokorp.com`: added to project, DNS pending

## Approved now: root-domain DNS cutover into Vercel redirect flow
- Required DNS record at provider (Squarespace DNS):
  - `A` record
  - Host/Name: `@`
  - Value/Points to: `76.76.21.21`
  - TTL: default or `300` seconds if editable
  - `A` record
  - Host/Name: `www`
  - Value/Points to: `76.76.21.21`
  - TTL: default or `300` seconds if editable
- Verification target:
  - `https://zokorp.com/...` redirects to `https://app.zokorp.com/...`
  - `https://www.zokorp.com/...` redirects to `https://app.zokorp.com/...`
- Scope guardrails:
  - Do not modify MX/TXT verification records

## Safest migration path
1. Keep domain registration where it is (Squarespace Domains).
2. Keep DNS management in current provider and only change web-hosting records required by Vercel.
3. Perform DNS cutover only after:
   - preview deployment is functional (current preview is `404`)
   - SSL/auth/payment callbacks are validated in preview/staging
4. Switch only apex `@` and `www` web records as instructed by Vercel.
5. Preserve email + verification records exactly as-is.

## Can the domain stay at Squarespace while hosting moves elsewhere?
- Yes. Domain transfer is not required to move hosting from Squarespace to Vercel.
- Preferred approach: keep registrar unchanged, change only DNS records needed for web serving.

## Cutover workflow (current)
1. Keep registrar unchanged.
2. Replace only the apex and `www` web-hosting records with Vercel’s required `A -> 76.76.21.21` records.
3. Apply only required web records in DNS.
4. Keep all non-web records unchanged.
5. Validate:
   - domain verification status in Vercel
   - SSL certificate issuance
   - `zokorp.com` redirecting to `https://app.zokorp.com`
   - `www.zokorp.com` redirecting to `https://app.zokorp.com`
   - auth callback URLs
   - payment return URLs and webhook endpoints (if enabled)

## Rollback plan

### Rollback table (prepare before go-live)
- Record: `@` A
  - Original value: `198.49.23.144`
  - Planned new value: _from Vercel at cutover time_
  - Rollback value: `198.49.23.144`
- Record: `www` CNAME
  - Original value: `ext-sq.squarespace.com.`
  - Planned new value: _from Vercel at cutover time_
  - Rollback value: `ext-sq.squarespace.com.`
- Record: `app` A (subdomain rollout)
  - Original value: _(no record)_
  - Planned new value: `76.76.21.21`
  - Rollback value: remove `app` A record

### Rollback procedure
1. Revert `@` and `www` to original values above.
2. Leave MX/TXT/verification records untouched.
3. Purge any accidental conflicting web records.
4. Re-test apex and `www` over HTTPS.
5. For subdomain rollback, remove `app` A record and verify `app.zokorp.com` no longer resolves.

### Success indicators
- `www.zokorp.com` redirects to `https://app.zokorp.com`
- `zokorp.com` redirects to `https://app.zokorp.com`
- SSL valid on both hostnames
- No email delivery disruption
- `app.zokorp.com` continues serving the Vercel app

### Failure indicators
- `404`/`502` on apex or `www`
- certificate mismatch or TLS errors
- inconsistent routing between apex and `www`
- unexpected email delivery failures
- `app.zokorp.com` unresolved after DNS propagation window
