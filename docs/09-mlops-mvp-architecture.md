# ZoKorp SMB MLOps MVP Architecture

_Last updated: 2026-03-03_

## 1) Product decisions locked from founder input

### Buyer experience
- Primary buyer is **not a single persona**.
- MVP supports three audience modes inside one product:
  - `C_SUITE`: business-first summaries, ROI/health-focused dashboards.
  - `TECH_LEAD`: delivery status, reliability, deployment posture.
  - `DATA_SCIENTIST`: run parameters, metrics, artifacts, model lifecycle details.
- This is implemented as a workspace preference per organization member, not separate products.

### Must-win use case for launch
- Founder is open-ended on vertical use case.
- MVP default: **batch model operations for SMB internal analytics** (training run tracking + batch scoring orchestration + deployment records + monitoring basics).
- This keeps launch broad while still proving core platform value.

### Execution and infrastructure strategy
- **Batch-first** for MVP.
- **BYO compute only** at launch for cost control.
- No long-running training/inference inside Vercel functions.
- SaaS app is the control plane; execution happens in customer-managed infrastructure via ZoKorp Runner.

### Commercial model (MVP)
- Launch with **subscription + metered overage**.
- `MLOps Starter` monthly/annual base subscription.
- Optional usage meter (`job_units`) for overage and future expansion.
- Onboarding modes:
  - Self-serve signup (default)
  - Sales-assisted onboarding path (captured as service workflow + higher-touch setup)

### Compliance scope
- No regulated vertical gating required at launch.
- Use strong baseline security, tenant isolation, audit logging, least privilege, and hardening docs.

## 2) Architecture summary

### Control plane (ZoKorp web app)
- Next.js App Router + TypeScript on Vercel.
- Prisma on Supabase Postgres.
- NextAuth magic-link auth (existing login preserved).
- Stripe Checkout + Billing Portal + usage ledger hooks.
- Server routes handle orchestration only: orgs, projects, jobs, runs, registry, deployments, monitoring, billing.

### Execution plane (ZoKorp Runner)
- Separate runner package in repo (`packages/zokorp-runner`).
- Customer deploys runner in their environment (VM/container/Kubernetes host).
- Runner loop:
  1. Authenticates with scoped API key.
  2. Polls control plane for queued jobs.
  3. Executes Docker container for job payload.
  4. Streams logs/status updates.
  5. Uploads artifacts via signed upload URLs.
  6. Reports terminal state + metrics summary.

### Data/storage model
- All MLOps records are scoped by `organizationId`.
- Membership model: `OWNER | ADMIN | MEMBER | VIEWER`.
- Core entities:
  - `Organization`, `OrganizationMember`
  - `MlopsProject`
  - `MlopsJob`, `MlopsJobLog`
  - `MlopsRun`
  - `MlopsModel`, `MlopsModelVersion`
  - `MlopsDeployment`
  - `MlopsArtifact`
  - `MlopsMonitoringEvent`, `MlopsDriftSnapshot`
  - `MlopsRunnerKey`
  - `MlopsUsageLedger`

### Tenant isolation strategy (MVP)
- Server-side authorization enforces org scoping for every read/write.
- Membership role checks are centralized in helper functions.
- API keys are org-scoped and hashed at rest.
- Audit logs capture sensitive actions.
- Note: Postgres RLS migration can be added after Prisma policy adaptation; this phase enforces strict app-layer isolation.

## 3) API and page map (MVP)

### UI routes
- `/mlops` — landing + quickstart + org/project snapshots.
- `/mlops/projects` — list/create projects.
- `/mlops/projects/:id` — project overview (jobs, deployments, recent runs).
- `/mlops/runs` — filterable run history.
- `/mlops/models` — model registry and version stages.
- `/mlops/deployments` — deployment records.
- `/mlops/monitoring` — baseline operational charts + drift summary.
- `/mlops/settings/billing` — plan/invoices/portal actions.
- `/mlops/settings/organization` — members, roles, runner keys, audit trail.

### Control plane API groups
- Org/project APIs for CRUD with role checks.
- Job APIs for queue + lifecycle transitions.
- Runner APIs for poll/claim/update/report.
- Billing APIs for checkout + portal + usage record hooks.
- Artifact API for signed upload URLs and metadata registration.

## 4) MVP boundaries (what is intentionally out)

- No hosted compute tier yet.
- No websocket dependence (status/logs use polling).
- No custom dispute center; Stripe-hosted flows only.
- No full feature store or orchestration DAG engine in v1.
- No HIPAA/SOC2 attestation in MVP (security-ready documentation included).

## 5) Release sequencing

1. Multi-tenant data model + authz helpers.
2. MLOps pages and secure APIs.
3. Runner CLI package + quickstart compose.
4. Billing surface for MLOps subscription/usage.
5. Monitoring/drift MVP views.
6. Tests, threat model docs, automation workflows.
7. Preview verification before production wiring changes.

## 6) Success criteria for this implementation phase

- Existing ZoKorp functionality remains stable.
- Authenticated user can create/use an organization and project.
- Jobs can be queued and observed through status transitions.
- Runner can claim and report jobs via API key.
- Model/deployment/monitoring records are visible and tenant-scoped.
- Billing page supports MLOps subscription and customer portal.
- Security and operations docs are updated for handoff and execution.
