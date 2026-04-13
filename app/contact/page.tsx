import type { Metadata } from "next";

import { MarketingSectionHeading } from "@/components/marketing/section-heading";
import { ServiceRequestPanel } from "@/components/service-request-panel";
import { auth } from "@/lib/auth";
import { CONTACT_PAGE_CONTENT } from "@/lib/marketing-content";
import { buildMarketingPageMetadata } from "@/lib/site";

export const metadata: Metadata = buildMarketingPageMetadata({
  title: "Contact",
  description: "Public requests go to consulting@zokorp.com. Initial response within one business day.",
  path: "/contact",
});

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const session = await auth();

  return (
    <div className="marketing-stack">
      <section className="space-y-6">
        <MarketingSectionHeading
          eyebrow={CONTACT_PAGE_CONTENT.eyebrow}
          title={CONTACT_PAGE_CONTENT.title}
          description={CONTACT_PAGE_CONTENT.lede}
          titleAs="h1"
        />

        <ServiceRequestPanel
          signedIn={Boolean(session?.user?.email)}
          currentEmail={session?.user?.email ?? null}
          loginHref="/login?callbackUrl=/contact"
          registerHref="/register"
          accountHref="/account"
        />
      </section>
    </div>
  );
}
