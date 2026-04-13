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
        mode="poster"
        eyebrow={CONTACT_PAGE_CONTENT.hero.eyebrow}
        title={CONTACT_PAGE_CONTENT.hero.title}
        lede={CONTACT_PAGE_CONTENT.hero.lede}
        supportingBullets={CONTACT_PAGE_CONTENT.hero.supportingBullets}
        proofChips={MARKETING_TRUST_CHIPS}
        primaryAction={{ href: bookingUrl, label: "Book a call", external: true }}
        secondaryAction={{ href: `mailto:${PUBLIC_LAUNCH_CONTACT.primaryEmail}`, label: "Email ZoKorp", variant: "secondary", external: true }}
        rail={
          <div className="grid gap-5">
            <section className="plane-dark rounded-[2.3rem] border border-white/8 px-5 py-5 md:px-6">
              <div className="space-y-3">
                <p className="enterprise-kicker text-white/72">Response expectation</p>
                <h2 className="font-display max-w-[9ch] text-[2.2rem] font-semibold leading-[0.96] text-white">
                  {PUBLIC_LAUNCH_CONTACT.responseWindowLabel}
                </h2>
              </div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white/88">
                  Houston, Texas
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-sm text-white/88">
                  Book a call when context matters more than another paragraph.
                </div>
              </div>
            </section>

            <section className="section-band px-5 py-5 md:px-6">
              <div className="space-y-2">
                <p className="enterprise-kicker">Email</p>
                <h2 className="font-display text-2xl font-semibold text-card-foreground">{PUBLIC_LAUNCH_CONTACT.primaryEmail}</h2>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Best for quotes, follow-up questions, or product help when you already know what you want to ask.
              </p>
            </section>
          </div>
        }
      />

      <section className="section-band px-5 py-5 md:px-6">
        <article className="grid gap-6 border-t border-border/80 py-5 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(0,0.54fr)_minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <p className="enterprise-kicker">Book a call</p>
            <h2 className="font-display max-w-[10ch] text-[2rem] font-semibold leading-[1.02] text-card-foreground">
              Use the call when context matters more than another paragraph.
            </h2>
          </div>
          <p className="max-w-[32ch] text-sm leading-7 text-muted-foreground">
            Best for architecture questions, scope framing, or cases where the fastest next step is a direct conversation.
          </p>
          <a href={bookingUrl} className={buttonVariants()}>
            Book a call
          </a>
        </article>

        <article className="grid gap-6 border-t border-border/80 py-5 lg:grid-cols-[minmax(0,0.54fr)_minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <p className="enterprise-kicker">Email directly</p>
            <h2 className="font-display max-w-[10ch] text-[2rem] font-semibold leading-[1.02] text-card-foreground">
              Use email when you already know the question.
            </h2>
          </div>
          <p className="max-w-[32ch] text-sm leading-7 text-muted-foreground">
            Best for quotes, product questions, or follow-up when the call is not necessary.
          </p>
          <a href={`mailto:${PUBLIC_LAUNCH_CONTACT.primaryEmail}`} className={buttonVariants({ variant: "secondary" })}>
            Email ZoKorp
          </a>
        </article>
      </section>

      <section className="hero-bleed plane-dark border-t border-white/8 py-12 md:py-14">
        <div className="marketing-container px-4 md:px-6 xl:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
            <div className="space-y-3">
              <p className="enterprise-kicker text-white/72">Contact posture</p>
              <h2 className="font-display max-w-[11ch] text-[2.4rem] font-semibold leading-[0.98] text-white md:text-[3.3rem]">
                Simple contact paths create more trust than a longer contact funnel.
              </h2>
            </div>

            <p className="max-w-[38ch] text-base leading-7 text-white/80">
              ZoKorp keeps contact minimal on purpose: book the first call, send the email, and get a response within one business day.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
