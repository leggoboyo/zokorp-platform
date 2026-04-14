import type { ReactNode } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type FounderProfileDetail = {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
};

type FounderProfileCardProps = {
  eyebrow?: string;
  name: string;
  role: string;
  summary?: string;
  details: readonly FounderProfileDetail[];
  imageSrc: string;
  imageAlt: string;
  className?: string;
};

export function FounderProfileCard({
  eyebrow = "Founder",
  name,
  role,
  summary,
  details,
  imageSrc,
  imageAlt,
  className,
}: FounderProfileCardProps) {
  return (
    <section className={cn("table-band rounded-[2.3rem] p-5 md:p-6 lg:min-h-[23rem]", className)}>
      <div className="grid gap-5 md:grid-cols-[9.5rem_minmax(0,1fr)] md:items-start lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-6">
        <div className="portrait-frame md:min-h-[12rem] lg:min-h-[15rem]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover object-[center_12%]"
            sizes="(max-width: 768px) 160px, 176px"
            priority
          />
        </div>

        <div className="flex h-full flex-col justify-between gap-5">
          <div className="space-y-2.5">
            <p className="enterprise-kicker">{eyebrow}</p>
            <div className="space-y-2">
              <h2 className="font-display text-[2.1rem] font-semibold leading-[0.96] tracking-[-0.04em] text-card-foreground md:text-[2.45rem]">
                {name}
              </h2>
              <p className="text-[1.12rem] leading-7 text-card-foreground/88">{role}</p>
              {summary ? <p className="max-w-[34ch] text-[0.98rem] leading-7 text-muted-foreground">{summary}</p> : null}
            </div>
          </div>

          <dl className="grid gap-3 border-t border-border/70 pt-4 text-sm text-card-foreground sm:grid-cols-2">
            {details.map((detail) => (
              <div key={detail.label} className={cn("space-y-1.5", detail.fullWidth && "sm:col-span-2")}>
                <dt className="table-kicker">{detail.label}</dt>
                <dd className="text-[1.02rem] leading-7 text-card-foreground">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
