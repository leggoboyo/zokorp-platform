# Stripe product map (test mode)

> Initial catalog only. Create in Stripe **test mode** first and record IDs here.

## Planned products & prices

| Product | Price | Type | Interval | Notes | Stripe Product ID | Stripe Price ID |
|---|---|---|---|---|---|---|
| FTR Validator | Single Run | One-time | N/A | $50 one-time | TBD | `STRIPE_PRICE_ID_FTR_SINGLE` |
| Competency Validation Review | Single Purchase | One-time | N/A | $500 one-time | TBD | `STRIPE_PRICE_ID_COMPETENCY_REVIEW` |
| ZoKorp Platform | Monthly | Subscription | month | hosted billing portal | TBD | `STRIPE_PRICE_ID_PLATFORM_MONTHLY` |
| ZoKorp Platform | Annual | Subscription | year | hosted billing portal | TBD | `STRIPE_PRICE_ID_PLATFORM_ANNUAL` |

## Usage-based placeholder
- Meter name: `platform_usage_units`
- Purpose: usage-based billing foundation; pricing TBD

## Keys
- Keep Stripe secret keys **out of the repo**; store in Vercel environment variables once ready.
