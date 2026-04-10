import Link from "next/link";

import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { buildAppPageMetadata } from "@/lib/site";

export const metadata = buildAppPageMetadata({
  title: "Sign-In Instructions",
  description: "ZoKorp uses business-email password sign-in. Return to the login page to continue.",
  path: "/login/verify-request",
});

export default function VerifyRequestPage() {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Card tone="glass" className="animate-fade-up rounded-2xl p-8">
        <p className="enterprise-kicker text-[rgb(var(--z-ink-label))]">Account Access</p>
        <h1 className="font-display mt-2 text-4xl font-semibold text-slate-900">Sign in with password</h1>
        <p className="enterprise-copy mt-3 text-sm md:text-base">
          Use your business email and password on the login page.
        </p>
      </Card>

      <Card tone="muted" lift className="rounded-2xl p-6">
        <div className="mt-1 flex flex-wrap gap-2">
          <Link href="/login" className={buttonVariants()}>
            Back to login
          </Link>
          <Link href="/" className={buttonVariants({ variant: "secondary" })}>
            Back to home
          </Link>
        </div>
      </Card>
    </div>
  );
}
