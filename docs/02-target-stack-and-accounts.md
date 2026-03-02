# Target stack and accounts

## Services and defaults
- Domain: zokorp.com (Squarespace registrar & DNS host)
- Code host: GitHub (private repo `zokorp-platform`)
- Deployment: Vercel (proj `zokorp-web`, linked to repo)
- Backend: Supabase (Postgres + Auth + Storage)
- Payments: Stripe first (test mode until launch)

## Accounts in use / identifiers (non-secrets)
- GitHub: `leggoboyo` / `zokorp-platform`
- Squarespace: zokorp.com domain + DNS (Zoho Mail MX/TXT present)
- Vercel: Team/account `leggoboyos-projects`, project `zokorp-web` with preview `https://zokorp-web.vercel.app`
- Supabase: Org `ZoKorp`, project `zokorp-platform` (ref `jhjgrxbzjmhxqjaaerjb`, region AWS us-west-2)
  - Project URL: `https://jhjgrxbzjmhxqjaaerjb.supabase.co`
  - Publishable API key: `sb_publishable_sJeMw_wjoUcM5DfBXfC-Dw_pSOt4S3Q`
  - DB password provided by human (store securely)
- Stripe: account `ZoKorp` (Test mode)
  - Stripe test customer portal config ID: `bpc_1T6On55wcnm215lA95megntn`

## Worklog (running)
- Phase 1: audited live site + DNS baseline
- Phase 2: created repo, docs scaffolding, 11 issues; created Vercel project; created Supabase project
- Phase 5: Stripe test products/prices created; customer portal default config created

## Verification before DNS cutover
- Working Vercel preview deployment
- Supabase auth/storage configured minimally
- Stripe test checkout flow validated
