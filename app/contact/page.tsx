import { MarketingHero } from "@/components/marketing/marketing-hero";
import { buttonVariants } from "@/components/ui/button";
import { CONTACT_PAGE_CONTENT, MARKETING_TRUST_CHIPS } from "@/lib/marketing-content";
import { PUBLIC_LAUNCH_CONTACT } from "@/lib/public-launch-contract";
import { buildCalendlyBookingUrl } from "@/lib/calendly";
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
          <div className="grid gap-4">
            <section className="marketing-panel rounded-[1.8rem] px-5 py-5">
              <div className="space-y-2">
                <p className="enterprise-kicker">Email</p>
                <h2 className="font-display text-2xl font-semibold text-card-foreground">{PUBLIC_LAUNCH_CONTACT.primaryEmail}</h2>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Best for quotes, follow-up questions, or product help when you already know what you want to ask.
              </p>
            </section>

            <section className="marketing-panel-dark rounded-[1.8rem] px-5 py-5">
              <div className="space-y-3">
                <p className="enterprise-kicker">Response expectation</p>
                <h2 className="font-display text-2xl font-semibold">{PUBLIC_LAUNCH_CONTACT.responseWindowLabel}</h2>
                <div className="grid gap-3">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white/88">
                    Houston, Texas
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white/88">
                    Book a call when a direct conversation is the faster next step.
                  </div>
                </div>
              </div>
            </section>
          </div>
        }
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="marketing-panel rounded-[1.8rem] px-6 py-6 md:px-7">
          <div className="space-y-4">
            <p className="enterprise-kicker">Book a call</p>
            <h2 className="font-display max-w-[12ch] text-[2.1rem] font-semibold leading-[1.02] text-card-foreground">
              Use the call when context matters more than another paragraph.
            </h2>
            <a href={bookingUrl} className={buttonVariants()}>
              Book a call
            </a>
          </div>
        </article>

        <article className="marketing-panel rounded-[1.8rem] px-6 py-6 md:px-7">
          <div className="space-y-4">
            <p className="enterprise-kicker">Email directly</p>
            <h2 className="font-display max-w-[12ch] text-[2.1rem] font-semibold leading-[1.02] text-card-foreground">
              Use email when you already know the question.
            </h2>
            <a href={`mailto:${PUBLIC_LAUNCH_CONTACT.primaryEmail}`} className={buttonVariants({ variant: "secondary" })}>
              Email ZoKorp
            </a>
          </div>
        </article>
      </section>
    </div>
  );
}
