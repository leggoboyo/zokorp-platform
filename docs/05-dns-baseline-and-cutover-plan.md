# DNS baseline + cutover plan for zokorp.com

## Current DNS host
- Squarespace (domain registered with Squarespace; DNS managed in Squarespace)

## Baseline records (captured pre-cutover)

### Squarespace defaults
- `@` — A — 198.49.23.144
- `www` — CNAME — ext-sq.squarespace.com
- `_domainconnect` — CNAME — _domainconnect.domains.squarespace.com

### Email (Zoho Mail) — do not touch
- `@` — MX — 10 mx.zoho.com
- `@` — MX — 20 mx2.zoho.com
- `@` — MX — 50 mx3.zoho.com
- SPF: `@` — TXT — `v=spf1 include:zohomail.com ~all`
- DKIM: `zmail._domainkey` — TXT — (Zoho DKIM key)
- DMARC: `_dmarc` — TXT — (DMARC policy with rua/ruf mailto targets)
- Zoho verification: `@` — TXT — `zoho-verification=...`

### Other verification records — preserve
- `@` — TXT — `MS=ms48124988`
- `@` — TXT — `openai-domain-verification=DOaygA2lLkxHpsFmJVC3mQ`
- `@` — TXT — `openai-domain-verification=KVdkluULF6tNGyqjipVSRg`

## Cutover workflow (only when app is ready)
1. In Vercel, add custom domain(s): `zokorp.com` (and `www.zokorp.com` if recommended).
2. Let Vercel provide exact required DNS records and add **only those records** in Squarespace.
   - Typically: apex `@` becomes an A record (Vercel edge IP), and `www` becomes a CNAME to Vercel’s DNS host.
3. Keep all email/verification TXT records unchanged.
4. Verify SSL, apex + www, redirects, and any auth/payment callback URLs.

## Rollback plan
- To revert, change apex `@` and `www` back to the Squarespace values above.
- Leave MX/TXT verification records untouched.
- Watch for failure indicators: certificate errors, partial connectivity (www works but apex doesn’t), email delivery issues.
