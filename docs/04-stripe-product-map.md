# Stripe product map (test mode)

> Initial catalog only. Created in Stripe **test mode**.

## Products/prices (test IDs)

- **FTR Validator — Single Run**
  - price: USD 50 one-time
  - product_id: `prod_U4XpwCnAI9OGjJ`
  - price_id: `price_1T6Ok95wcnm215lAmfzvDgov`
  - env var mapping: `STRIPE_PRICE_ID_FTR_SINGLE`

- **Competency Validation Review — Single Purchase**
  - price: USD 500 one-time
  - product_id: `prod_U4Xq9hET6yAEuG`
  - price_id: `price_1T6OkZ5wcnm215lAu28bpxYD`
  - env var mapping: `STRIPE_PRICE_ID_COMPETENCY_REVIEW`

- **ZoKorp Platform — Monthly**
  - price: USD 1/month (**placeholder pricing; fix before launch**)
  - product_id: `prod_U4XqLrequWQSbj`
  - price_id: `price_1T6Ol35wcnm215lAyWsfGR6q`
  - env var mapping: `STRIPE_PRICE_ID_PLATFORM_MONTHLY`

- **ZoKorp Platform — Annual**
  - price: USD 10/year (**placeholder pricing; fix before launch**)
  - product_id: `prod_U4XrrmAj5XHAzk`
  - price_id: `price_1T6Oln5wcnm215lAUXJ9gNQt`
  - env var mapping: `STRIPE_PRICE_ID_PLATFORM_ANNUAL`

## Billing portal
- Test customer portal configuration created: `bpc_1T6On55wcnm215lA95megntn`
- No custom branding/policy decisions made yet; just default settings.

## Usage-based placeholder
- Meter name: `platform_usage_units`
- Purpose: usage-based billing foundation; pricing TBD

## Keys
- Keep Stripe secret keys **out of the repo**; store in Vercel env vars once ready.
