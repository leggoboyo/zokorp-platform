# Deep Research Prompt After Phase 2

Paste this into ChatGPT Deep Research:

```text
You are ChatGPT Deep Research. Continue from the current LOCAL implementation state of `zokorp-platform` as of March 24, 2026 (America/Chicago). Do not re-open stale assumptions from `main` or public branch state unless the local repo contents contradict the implementation summary below.

FOUNDER CONTEXT
- The founder is non-technical and wants plain-English recommendations first, technical detail second.
- The product strategy is privacy-first and booking-first.
- The architecture review itself remains free.
- The result email is now the conversion surface for implementation work.

LOCAL IMPLEMENTATION CONTEXT ALREADY COMPLETED

PHASE 1
- Privacy-first lead handling is implemented locally.
- Free diagnostic tools default to minimal lead/event storage.
- CRM sync is opt-in only.
- Opt-in archival exists with bounded retention.
- Retention sweep infrastructure exists locally.
- Admin lead reporting reads from the privacy-first lead model by default.

PHASE 2
- The architecture review still uses the existing code-backed scoring and rule-detection engine.
- The architecture result email has been changed from package-style engagement selling to a booking-first model.
- The free architecture review email now includes:
  - a final implementation quote total,
  - itemized quote lines keyed to detected `ruleId`s,
  - assumptions,
  - exclusions,
  - estimate/reference code,
  - one booking CTA only.
- The architecture result email does NOT include:
  - a pay-now link,
  - a deposit link,
  - a full-checkout link,
  - a public package menu.
- Public “hire me” language for this flow now lives on `/services`, not on the free tool page as a payment flow.
- The system still preserves the free upload -> email-first delivery pattern.

PRIVATE ARCHITECTURE RULE CATALOG
- A founder-only private rule catalog has been added for the architecture review.
- Code remains the source of truth for:
  - `ruleId`
  - category
  - scoring semantics
  - activation logic
- The private database now adds reviewed pricing/copy overrides through:
  - `ArchitectureRuleCatalog`
  - `ArchitectureRuleCatalogRevision`
- Catalog behavior:
  - missing code-backed rules sync in as `UNREVIEWED`
  - drafts do not affect runtime
  - only published revisions affect live quote output
  - changed or removed code rules are marked `STALE`
  - runtime precedence is published catalog row if status is `PUBLISHED`, otherwise code fallback
- Founder-editable fields are limited to:
  - service line label
  - public fix summary/playbook
  - internal research notes
  - pricing mode (`DERIVED` or `OVERRIDE`)
  - override min/max price
  - next review date
- Founder cannot edit scoring logic from the admin UI.
- Quote generation now records which published rule revisions were used so quote reconstruction is possible later from internal audit metadata.

ADMIN WORKFLOW
- There is now a private admin section for the architecture catalog.
- It supports:
  - catalog list
  - search/filter
  - stale / needs-review / recently-updated views
  - per-rule detail page
  - draft save
  - publish live revision
  - revision history

LOCKED PRODUCT / COMMERCIAL DECISIONS
- Architecture review stays free.
- The result email includes the final itemized implementation quote.
- The result email includes a booking link only.
- Payment happens later, after the booking conversation.
- There is no pay-now link in the result email.
- Public paid-offer messaging for this flow lives on `/services`.
- The founder wants the internal architecture-fix/pricing database to grow over time and be reviewed manually.

WHAT I NEED FROM YOU NOW
Review the CURRENT LOCAL repo contents and produce a Phase 3 advisory pack focused on what should happen next after the privacy-first foundation and booking-first architecture quote system.

YOUR TASKS

1. VERIFY THE LOCAL IMPLEMENTATION
- Confirm whether the booking-first architecture email flow is implemented in a way that matches the above summary.
- Confirm whether the private architecture rule catalog is actually wired into runtime quote generation and admin publishing.
- Call out anything that is partial, inconsistent, or easy to misunderstand.

2. IDENTIFY THE TOP REMAINING RISKS
Prioritize practical founder/business risk, not theoretical code purity.
Examples:
- quote trust risk
- pricing governance risk
- stale catalog risk
- founder workflow bottlenecks
- operational risk in follow-up / booking flow
- missing manual processes needed to keep pricing accurate
- legal or copy risk in how quotes are framed
- deployment or migration risk

3. RECOMMEND THE NEXT PHASE
Choose and justify the best next major step. Do not just list options.
Likely candidates:
- founder ops tooling and workflow hardening for the architecture catalog
- Stripe/payment flow after booking
- services/CRM pipeline hardening
- marketing/app split
- stronger admin audit/reporting
- a second private pricing catalog for another tool

Pick the best order and say what should be delayed on purpose.

4. ADVISE ON THE INTERNAL PRICING KNOWLEDGE BASE
I specifically want advice on how to make the founder-only architecture pricing/fix database sustainable over time.
Evaluate:
- whether the current rule-level override model is enough
- whether package-level or bundle-level pricing should be added later
- whether a review cadence / stale policy / benchmark workflow should be added
- whether external research should feed draft suggestions instead of live changes
- what minimum founder process should exist so quotes stay trustworthy

5. ADVISE ON BOOKING-FIRST SALES FLOW
Evaluate whether the current flow should remain:
free review -> final quote email -> booking link -> human conversation -> payment later

Tell me:
- whether this is the right flow for SMB trust
- when a direct payment step should be introduced, if ever
- what exact wording a non-technical SMB buyer is most likely to trust
- what should happen operationally after someone clicks the booking link

6. LIST HUMAN / ATLAS TASKS
List anything Codex cannot safely do alone and that requires:
- booking tool setup
- domain or DNS work
- Vercel settings
- secrets entry
- Stripe setup
- CRM field mapping
- copy/legal review
- founder process setup

7. WRITE THE NEXT CODEX PROMPT
Give me a strong next-step Codex prompt that:
- assumes the above local state is true,
- does NOT ask Codex to redo Phase 1,
- does NOT ask Codex to undo the booking-first decision,
- clearly defines the next recommended implementation phase.

REPO PATHS TO PRIORITIZE
- `lib/architecture-review/email.ts`
- `lib/architecture-review/rule-catalog.ts`
- `lib/architecture-review/jobs.ts`
- `lib/architecture-review/pricing-catalog.ts`
- `app/admin/architecture-catalog/page.tsx`
- `app/admin/architecture-catalog/[ruleId]/page.tsx`
- `app/admin/actions.ts`
- `app/services/page.tsx`
- `prisma/schema.prisma`
- `prisma/migrations/0014_architecture_rule_catalog/`
- related tests

RETURN FORMAT
1. EXECUTIVE SUMMARY
2. IMPLEMENTATION VERIFICATION
3. TOP RISKS
4. PHASE 3 RECOMMENDATION
5. PRICING KNOWLEDGE BASE ADVICE
6. BOOKING-FIRST SALES ADVICE
7. HUMAN / ATLAS TASKS
8. NEXT CODEX PROMPT

STYLE
- Write for a smart non-technical founder.
- Be decisive.
- Challenge weak assumptions.
- Use exact dates where relevant.
- If you infer something, label it as an inference.
```
