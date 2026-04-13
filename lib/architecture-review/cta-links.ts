import { createArchitectureReviewCtaToken } from "@/lib/architecture-review/cta-token";
import { getArchitectureCallUrl } from "@/lib/marketing-cta";
import { getAppSiteUrl, getMarketingSiteUrl } from "@/lib/site";

function ctaSecret() {
  return process.env.ARCH_REVIEW_CTA_SECRET ?? process.env.ARCH_REVIEW_EML_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";
}

export async function buildArchitectureReviewCtaLinks(leadId: string) {
  const secret = ctaSecret();
  const appSiteUrl = getAppSiteUrl();
  const marketingSiteUrl = getMarketingSiteUrl();

  if (!secret) {
    return {
      bookArchitectureCallUrl: getArchitectureCallUrl({
        utmMedium: "architecture-review-email",
      }),
      requestRemediationPlanUrl: process.env.ARCH_REVIEW_REMEDIATION_PLAN_URL ?? `${marketingSiteUrl}/contact`,
    };
  }

  const bookToken = createArchitectureReviewCtaToken({ leadId, ctaType: "book-call" }, secret);
  const remediationToken = createArchitectureReviewCtaToken({ leadId, ctaType: "remediation-plan" }, secret);

  return {
    bookArchitectureCallUrl: `${appSiteUrl}/api/architecture-review/cta?token=${encodeURIComponent(bookToken)}`,
    requestRemediationPlanUrl: `${appSiteUrl}/api/architecture-review/cta?token=${encodeURIComponent(remediationToken)}`,
  };
}
