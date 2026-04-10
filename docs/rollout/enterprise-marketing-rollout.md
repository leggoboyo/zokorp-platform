# Enterprise Marketing Rollout

## Scope
- Canonical marketing host is `https://www.zokorp.com`.
- `https://zokorp.com` permanently redirects to `https://www.zokorp.com`.
- `https://app.zokorp.com` is app-focused and rewrites `/` to the app landing page.
- Corporate marketing routes on the app host redirect to `https://www.zokorp.com`.
- `/software` and `/software/[slug]` remain reachable on both hosts as a bridge. They canonicalize to `www` and return `noindex` on the app host.
- CRM, Zoho, and Calendly mutation tests remain disabled. Browser validation runs in readonly mode.

## Files Involved
- Routing and crawl policy: `proxy.ts`, `lib/site.ts`, `app/robots.ts`, `app/sitemap.ts`
- Marketing refresh: `app/page.tsx`, `app/about/page.tsx`, `app/services/page.tsx`, `app/contact/page.tsx`, `app/pricing/page.tsx`, `app/software/page.tsx`, `app/app-home/page.tsx`
- Shared design system surfaces: `app/globals.css`, `styles/zokorp-tokens.css`, `components/site-header.tsx`, `components/site-header-shell.tsx`, `components/site-footer.tsx`, `components/service-request-panel.tsx`, `components/ui/button.tsx`, `components/ui/card.tsx`
- QA: `playwright.config.ts`, `tests/e2e/*.spec.ts`, `scripts/accessibility_audit.mjs`

## Preview Validation
1. Deploy the branch to a Vercel preview environment.
2. Set:
   - `JOURNEY_MARKETING_BASE_URL` to the preview marketing URL.
   - `JOURNEY_APP_BASE_URL` to the preview app URL if split-host preview is available.
   - `JOURNEY_EXPECTED_MARKETING_CANONICAL_BASE_URL=https://www.zokorp.com`
   - `JOURNEY_EXPECTED_APP_CANONICAL_BASE_URL=https://app.zokorp.com`
   - `E2E_MUTATION_MODE=readonly`
3. Run:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run test:e2e
   ```
4. Confirm:
   - Apex redirects to `www`.
   - `www` homepage stays on marketing and does not bounce to login.
   - `app /` loads the app landing page.
   - App-host marketing routes redirect to `www`.
   - `app /robots.txt` does not publish `Host` or `Sitemap`.
   - `app /sitemap.xml` returns `404`.
   - Playwright finishes with traces and screenshots available for failures only.

## Local Validation
- Local single-origin development is supported by the Playwright suite.
- Run:
  ```bash
  JOURNEY_MARKETING_BASE_URL=http://127.0.0.1:3001 \
  JOURNEY_APP_BASE_URL=http://127.0.0.1:3001 \
  E2E_MUTATION_MODE=readonly \
  npm run test:e2e
  ```
- Expected behavior:
  - Marketing and accessibility flows pass locally.
  - Distinct-host routing checks skip automatically because local validation uses a single origin.

## Production Readonly Validation
1. After deploy, run readonly browser QA against production.
2. Set:
   - `JOURNEY_MARKETING_BASE_URL=https://www.zokorp.com`
   - `JOURNEY_APP_BASE_URL=https://app.zokorp.com`
   - `JOURNEY_EXPECTED_MARKETING_CANONICAL_BASE_URL=https://www.zokorp.com`
   - `JOURNEY_EXPECTED_APP_CANONICAL_BASE_URL=https://app.zokorp.com`
   - `E2E_MUTATION_MODE=readonly`
3. Run:
   ```bash
   npm run test:e2e:production
   npm run journey:a11y
   npm run smoke:production
   ```
4. Review:
   - Redirect status codes and `Location` headers.
   - Canonical tags on public marketing routes.
   - `X-Robots-Tag` on app-host bridge routes.
   - Console errors, page errors, and failed requests captured by Playwright diagnostics.

## Rollback Criteria
- Any marketing route unexpectedly redirects to `/login`.
- Apex no longer redirects to `www`.
- `app /` stops rendering the app landing page.
- App-host corporate marketing routes stop redirecting to `www`.
- `robots.txt` or `sitemap.xml` on the app host regresses to a marketing crawl surface.
- A critical Playwright suite fails on production.
- New serious or critical accessibility violations are introduced.
- New console or runtime errors appear on homepage load.

## Post-Deploy Monitoring
- Check Vercel logs for the first 1 to 2 hours after deploy.
- Watch for redirect loops, proxy errors, or unexpected 404s on app-host marketing routes.
- Confirm there is no noticeable layout shift on homepage hero or founder section.
- Confirm service request UI still validates correctly without submitting live CRM mutations.
- Re-check the homepage, services page, about page, and app landing page on desktop and mobile.

## Manual Verification Checklist
- Keyboard navigation keeps a visible focus state across header, hero CTAs, nav menus, footer links, and service request controls.
- Homepage has exactly one `h1`.
- Founder proof text matches the approved wording only.
- No placeholder or template copy is visible.
- The founder portrait looks balanced on desktop and mobile.
- Dark sections keep readable contrast for labels, links, and CTA buttons.

## Notes
- Distinct-host behavior is validated most accurately in preview or production because local development typically runs from one origin.
- If DNS or Vercel domain settings ever need adjustment, output the exact records and rationale for manual application rather than changing registrar settings directly.
