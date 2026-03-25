import { describe, expect, it, vi } from "vitest";

import { buildLandingZoneReadinessEmailContent } from "@/lib/landing-zone-readiness/email";
import { buildLandingZoneReadinessReport } from "@/lib/landing-zone-readiness/engine";
import { landingZoneReadinessAnswersSchema } from "@/lib/landing-zone-readiness/types";

describe("landing zone readiness email", () => {
  it("renders a deterministic estimate breakdown from shared line items", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-06T18:00:00.000Z"));

    const answers = landingZoneReadinessAnswersSchema.parse({
      email: "owner@acmecloud.com",
      fullName: "Jordan Rivera",
      companyName: "Acme Cloud",
      roleTitle: "CTO",
      website: "acmecloud.com",
      primaryCloud: "aws",
      secondaryCloud: "azure",
      numberOfEnvironments: "3",
      numberOfRegions: "2_3",
      employeeCount: "26_100",
      engineeringTeamSize: "6_20",
      handlesSensitiveData: true,
      hasSso: "yes",
      enforcesMfa: "no",
      centralizedIdentity: "yes",
      breakGlassProcess: "yes",
      documentedRbac: "yes",
      serviceAccountHygiene: "yes",
      usesOrgHierarchy: "yes",
      separateCloudAccounts: "no",
      sharedServicesModel: "yes",
      guardrailsPolicy: "yes",
      standardNetworkArchitecture: "yes",
      productionIsolation: "no",
      ingressEgressControls: "yes",
      privateConnectivity: "yes",
      documentedDnsStrategy: "yes",
      networkCleanup: "yes",
      secretsManagement: "no",
      keyManagement: "yes",
      baselineSecurityLogging: "yes",
      vulnerabilityScanning: "yes",
      privilegeReviews: "yes",
      patchingOwnership: "yes",
      centralizedLogs: "no",
      metricsDashboards: "yes",
      alertingCoverage: "yes",
      backupCoverage: "yes",
      restoreTesting: "no",
      definedRecoveryTargets: "yes",
      crossRegionResilience: "yes",
      drDocumentation: "yes",
      infrastructureAsCode: "no",
      changesViaCiCd: "yes",
      manualProductionChanges: "blocked",
      codeReviewRequired: "yes",
      driftDetection: "yes",
      taggingStandard: "yes",
      budgetAlerts: "yes",
      resourceOwnership: "yes",
      lifecycleCleanup: "yes",
      nonProdShutdown: "yes",
      clearEnvironmentSeparation: "yes",
      runbooks: "yes",
      onCallOwnership: "yes",
      incidentResponseProcess: "yes",
      biggestChallenge: "Keeping controls consistent while the team scales.",
    });

    const report = buildLandingZoneReadinessReport(answers);
    const email = buildLandingZoneReadinessEmailContent({ answers, report });

    expect(report.quote.lineItems.length).toBeGreaterThanOrEqual(3);
    expect(email.text).toContain("Estimate breakdown:");
    expect(email.text).toContain(report.quote.lineItems[0]!.label);
    expect(email.html).toContain("Estimate breakdown");
    expect(email.html).toContain(report.quote.lineItems[0]!.label);
  });
});
