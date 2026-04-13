import { MarketingHero } from "@/components/marketing/marketing-hero";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { buildCalendlyBookingUrl } from "@/lib/calendly";
import { CONTACT_PAGE_CONTENT, MARKETING_TRUST_CHIPS } from "@/lib/marketing-content";
import { PUBLIC_LAUNCH_CONTACT } from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata, getMarketingSiteUrl } from "@/lib/site";

export const metadata = buildMarketingPageMetadata({
  title: "Contact",
  description: "Book a call or email ZoKorp directly. Initial response within one business day.",
  path: "/contact",
});

export default function ContactPage() {
  const marketingSiteUrl = getMarketingSiteUrl();
  const bookingUrl = buildCalendlyBookingUrl({
    baseUrl: process.env.ARCH_REVIEW_BOOK_CALL_URL ?? `${marketingSiteUrl}/services#service-request`,
    utmMedium: "contact-page",
  });

  return (
    <div className="marketing-stack">
      <MarketingHero
        eyebrow={CONTACT_PAGE_CONTENT.hero.eyebrow}
        title={CONTACT_PAGE_CONTENT.hero.title}
        lede={CONTACT_PAGE_CONTENT.hero.lede}
        supportingBullets={CONTACT_PAGE_CONTENT.hero.supportingBullets}
        proofChips={MARKETING_TRUST_CHIPS}
        primaryAction={{ href: bookingUrl, label: "Book a call", external: true }}
        secondaryAction={{ href: `mailto:${PUBLIC_LAUNCH_CONTACT.primaryEmail}`, label: "Email ZoKorp", variant: "secondary", external: true }}
        rail={
          <>
            <Card className="rounded-[1.8rem] border border-border bg-card p-6 shadow-none">
              <CardHeader className="gap-2 px-0">
                <p className="enterprise-kicker">Email</p>
                <h2 className="font-display text-2xl font-semibold text-card-foreground">{PUBLIC_LAUNCH_CONTACT.primaryEmail}</h2>
              </CardHeader>
              <CardContent className="px-0">
                <p className="text-sm leading-7 text-muted-foreground">
                  Best for quotes, follow-up questions, or product help when you already know what you want to ask.
                </p>
              </CardContent>
            </Card>

            <Card tone="plain" className="theme-dark rounded-[1.8rem] border border-border p-6 shadow-none">
              <CardHeader className="gap-2 px-0">
                <p className="enterprise-kicker">Response expectation</p>
                <h2 className="font-display text-2xl font-semibold">{PUBLIC_LAUNCH_CONTACT.responseWindowLabel}</h2>
              </CardHeader>
              <CardContent className="space-y-3 px-0">
                <div className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-card-foreground">
                  Houston, Texas
                </div>
                <div className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-card-foreground">
                  Book a call when a direct conversation is the faster next step.
                </div>
              </CardContent>
            </Card>
          </>
        }
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-[1.6rem] border border-border bg-card p-6 shadow-none">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker">Book a call</p>
            <h2 className="font-display text-3xl font-semibold text-card-foreground">Use the call when context matters more than another paragraph.</h2>
          </CardHeader>
          <CardContent className="px-0">
            <a href={bookingUrl} className={buttonVariants()}>
              Book a call
            </a>
          </CardContent>
        </Card>

        <Card className="rounded-[1.6rem] border border-border bg-card p-6 shadow-none">
          <CardHeader className="gap-2 px-0">
            <p className="enterprise-kicker">Email directly</p>
            <h2 className="font-display text-3xl font-semibold text-card-foreground">Use email when you already know the question.</h2>
          </CardHeader>
          <CardContent className="px-0">
            <a href={`mailto:${PUBLIC_LAUNCH_CONTACT.primaryEmail}`} className={buttonVariants({ variant: "secondary" })}>
              Email ZoKorp
            </a>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
