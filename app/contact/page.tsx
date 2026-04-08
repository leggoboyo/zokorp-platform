import Link from "next/link";

import { ServiceRequestPanel } from "@/components/service-request-panel";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { buildCalendlyBookingUrl } from "@/lib/calendly";
import { auth } from "@/lib/auth";
import { SOFT_LAUNCH_RESPONSE_WINDOWS } from "@/lib/launch-posture";
import { PUBLIC_LAUNCH_CONTACT } from "@/lib/public-launch-contract";
import { buildMarketingPageMetadata, getAppSiteUrl, getMarketingSiteUrl } from "@/lib/site";

export const metadata = buildMarketingPageMetadata({
  title: "Contact",
  description: "Book a call, request a quote, or contact ZoKorp directly for consulting and software questions.",
  path: "/contact",
});

const contactPaths = [
  {
    title: "Book a call",
    detail: "Best when you want a founder-led architecture conversation and already know a direct discussion would be useful.",
  },
  {
    title: "Get a quote",
    detail: "Best when you need a scoped service request, a remediation estimate, or a readiness package recommendation.",
  },
  {
    title: "Create account",
    detail: "Best when you are ready to use software, track activity, or manage billing inside the app experience.",
  },
] as const;

const contactChecklist = [
  "Company or team name",
  "What you are evaluating or trying to fix",
  "Desired timeline or delivery window",
  "Whether you want consulting, software, or both",
] as const;

export default async function ContactPage() {
  const session = await auth();
  const appSiteUrl = getAppSiteUrl();
  const marketingSiteUrl = getMarketingSiteUrl();
  const bookingUrl = buildCalendlyBookingUrl({
    baseUrl: process.env.ARCH_REVIEW_BOOK_CALL_URL ?? `${marketingSiteUrl}/services#service-request`,
    utmMedium: "contact-page",
  });

  return (
    <div className="space-y-10 md:space-y-12">
      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7f5f1_100%)] px-6 py-8 shadow-[0_20px_40px_rgba(15,23,42,0.06)] md:px-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Contact ZoKorp</p>
            <h1 className="font-display mt-4 max-w-4xl text-balance text-4xl font-semibold leading-tight text-slate-950 md:text-6xl">
              Start the right conversation without getting pushed into signup first.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              ZoKorp keeps contact simple: direct founder calls, quote requests, software exploration, and a public
              email path. Browse first, contact when ready, create an account only if you want to use the app.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={bookingUrl} className={buttonVariants({ size: "lg" })}>
                Book a call
              </a>
              <Link href="#service-request" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                Get a quote
              </Link>
              <Link href={`${appSiteUrl}/register`} className={buttonVariants({ variant: "ghost", size: "lg" })}>
                Create account
              </Link>
            </div>
          </div>

          <Card className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
            <CardHeader className="gap-2 px-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Direct details</p>
              <h2 className="font-display text-3xl font-semibold text-slate-950">Founder-led contact paths</h2>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Email</p>
                <a href={`mailto:${PUBLIC_LAUNCH_CONTACT.primaryEmail}`} className="mt-2 block text-lg font-semibold text-slate-950">
                  {PUBLIC_LAUNCH_CONTACT.primaryEmail}
                </a>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Location</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{PUBLIC_LAUNCH_CONTACT.location}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">LinkedIn</p>
                <a href={PUBLIC_LAUNCH_CONTACT.linkedInUrl} className="mt-2 block text-sm font-medium text-slate-900">
                  {PUBLIC_LAUNCH_CONTACT.linkedInUrl.replace("https://", "")}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {contactPaths.map((item) => (
          <Card key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-none">
            <CardHeader className="gap-2 px-0">
              <h2 className="font-display text-2xl font-semibold text-slate-950">{item.title}</h2>
            </CardHeader>
            <CardContent className="px-0">
              <p className="text-sm leading-7 text-slate-600">{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[1.8rem] border border-slate-200 bg-[#111827] p-6 text-slate-50 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Response posture</p>
            <h2 className="font-display text-3xl font-semibold">Direct contact is preferred. Hidden funnels are not.</h2>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            <p className="text-sm leading-7 text-slate-200">
              Use the public quote form when you want structured follow-up. Use the booking link when a real
              conversation is the better next step. Use software first if you want to explore the product side before
              talking to anyone.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {SOFT_LAUNCH_RESPONSE_WINDOWS.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-100">{item.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-none md:p-8">
          <CardHeader className="gap-2 px-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">What to include</p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">A little context makes follow-up faster.</h2>
          </CardHeader>
          <CardContent className="space-y-3 px-0">
            {contactChecklist.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </CardContent>
          <CardFooter className="px-0">
            <a href={`mailto:${PUBLIC_LAUNCH_CONTACT.primaryEmail}`} className={buttonVariants()}>
              Email ZoKorp
            </a>
            <Link href="/software" className={buttonVariants({ variant: "secondary" })}>
              Explore software
            </Link>
          </CardFooter>
        </Card>
      </section>

      <ServiceRequestPanel
        signedIn={Boolean(session?.user?.email)}
        currentEmail={session?.user?.email ?? null}
        loginHref={`${appSiteUrl}/login?callbackUrl=/contact`}
        registerHref={`${appSiteUrl}/register`}
        accountHref={`${appSiteUrl}/account`}
      />
    </div>
  );
}
