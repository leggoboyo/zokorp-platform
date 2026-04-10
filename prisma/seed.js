/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, AccessModel, PriceKind } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.product.updateMany({
    where: { slug: "free-template-tool" },
    data: { active: false },
  });

  const validator = await prisma.product.upsert({
    where: { slug: "zokorp-validator" },
    update: {
      name: "ZoKorpValidator",
      description:
        "ValidationChecklistValidator for FTR, SDP/SRP, and Competency workflows.",
      accessModel: AccessModel.ONE_TIME_CREDIT,
      active: true,
    },
    create: {
      slug: "zokorp-validator",
      name: "ZoKorpValidator",
      description:
        "ValidationChecklistValidator for FTR, SDP/SRP, and Competency workflows.",
      accessModel: AccessModel.ONE_TIME_CREDIT,
      active: true,
    },
  });

  const freeReviewer = await prisma.product.upsert({
    where: { slug: "architecture-diagram-reviewer" },
    update: {
      name: "Architecture Diagram Reviewer",
      description:
        "Evidence-backed architecture review for AWS, Azure, GCP, and multi-cloud diagrams with official guidance links, actionable findings, and estimate-first follow-up.",
      accessModel: AccessModel.FREE,
      active: true,
    },
    create: {
      slug: "architecture-diagram-reviewer",
      name: "Architecture Diagram Reviewer",
      description:
        "Evidence-backed architecture review for AWS, Azure, GCP, and multi-cloud diagrams with official guidance links, actionable findings, and estimate-first follow-up.",
      accessModel: AccessModel.FREE,
      active: true,
    },
  });

  const architectureRemediation = await prisma.product.upsert({
    where: { slug: "architecture-review-remediation" },
    update: {
      name: "Architecture Review Remediation",
      description:
        "Hidden remediation checkout product for payable architecture-review quote line items.",
      accessModel: AccessModel.FREE,
      active: true,
    },
    create: {
      slug: "architecture-review-remediation",
      name: "Architecture Review Remediation",
      description:
        "Hidden remediation checkout product for payable architecture-review quote line items.",
      accessModel: AccessModel.FREE,
      active: true,
    },
  });

  await prisma.product.updateMany({
    where: {
      slug: {
        in: ["ai-decider", "landing-zone-readiness-checker", "cloud-cost-leak-finder"],
      },
    },
    data: {
      active: false,
    },
  });

  const mlopsPlatform = await prisma.product.upsert({
    where: { slug: "mlops-foundation-platform" },
    update: {
      name: "ZoKorp Forecasting Beta",
      description:
        "Forecasting workspace for SMB teams: upload spreadsheet data, run practical revenue forecasts, review outputs, and add only the modules you need.",
      accessModel: AccessModel.SUBSCRIPTION,
      active: true,
    },
    create: {
      slug: "mlops-foundation-platform",
      name: "ZoKorp Forecasting Beta",
      description:
        "Forecasting workspace for SMB teams: upload spreadsheet data, run practical revenue forecasts, review outputs, and add only the modules you need.",
      accessModel: AccessModel.SUBSCRIPTION,
      active: true,
    },
  });

  const prices = [
    {
      envVar: process.env.STRIPE_PRICE_ID_FTR_SINGLE,
      amount: 5000,
      kind: PriceKind.CREDIT_PACK,
      creditsGranted: 1,
      creditTier: "FTR",
    },
    {
      envVar: process.env.STRIPE_PRICE_ID_SDP_SRP_SINGLE,
      amount: 15000,
      kind: PriceKind.CREDIT_PACK,
      creditsGranted: 1,
      creditTier: "SDP_SRP",
    },
    {
      envVar: process.env.STRIPE_PRICE_ID_COMPETENCY_REVIEW,
      amount: 50000,
      kind: PriceKind.CREDIT_PACK,
      creditsGranted: 1,
      creditTier: "COMPETENCY",
    },
    {
      envVar: process.env.STRIPE_PRICE_ID_PLATFORM_MONTHLY,
      amount: 100,
      kind: PriceKind.SUBSCRIPTION,
      creditsGranted: 0,
      creditTier: "GENERAL",
    },
    {
      envVar: process.env.STRIPE_PRICE_ID_PLATFORM_ANNUAL,
      amount: 1000,
      kind: PriceKind.SUBSCRIPTION,
      creditsGranted: 0,
      creditTier: "GENERAL",
    },
  ];

  for (const item of prices) {
    if (!item.envVar) {
      continue;
    }

    await prisma.price.upsert({
      where: { stripePriceId: item.envVar },
      update: {
        amount: item.amount,
        kind: item.kind,
        creditsGranted: item.creditsGranted,
        creditTier: item.creditTier,
        active: true,
        productId:
          item.kind === PriceKind.SUBSCRIPTION
            ? mlopsPlatform.id
            : validator.id,
      },
      create: {
        stripePriceId: item.envVar,
        amount: item.amount,
        currency: "usd",
        kind: item.kind,
        creditsGranted: item.creditsGranted,
        creditTier: item.creditTier,
        active: true,
        productId:
          item.kind === PriceKind.SUBSCRIPTION
            ? mlopsPlatform.id
            : validator.id,
      },
    });
  }

  console.log(
    `Seeded products: ${validator.slug}, ${freeReviewer.slug}, ${architectureRemediation.slug}, ${mlopsPlatform.slug}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
