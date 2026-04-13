import Link from "next/link";

import { ToolResultDeliveryBanner } from "@/components/software/ToolResultDeliveryBanner";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

type ToolEngagementGuideProps = {
  title: string;
  deliveryTitle: string;
  deliveryDescription: string;
  deliveryDetail: string;
  serviceDescription: string;
  requestHref: string;
  supportHref: string;
};

export function ToolEngagementGuide({
  title,
  deliveryTitle,
  deliveryDescription,
  deliveryDetail,
  serviceDescription,
  requestHref,
  supportHref,
}: ToolEngagementGuideProps) {
  return (
    <Card tone="glass" className="rounded-[calc(var(--radius-xl)+0.25rem)] p-6">
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Suite guide</p>
        <h2 className="font-display text-3xl font-semibold text-slate-900">{title}</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <ToolResultDeliveryBanner
          tone="info"
          title={deliveryTitle}
          description={deliveryDescription}
          detail={deliveryDetail}
        />
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-700">
          {serviceDescription}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={requestHref} className={buttonVariants()}>
          Request help
        </Link>
        <Link href={supportHref} className={buttonVariants({ variant: "secondary" })}>
          Support
        </Link>
      </CardFooter>
    </Card>
  );
}
