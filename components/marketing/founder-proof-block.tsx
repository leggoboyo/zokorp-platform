import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FounderProofStripProps = {
  mode: "strip";
  eyebrow: string;
  statement: string;
  support: string;
  sectorLine?: string;
  className?: string;
};

type FounderProofSectionProps = {
  mode: "section";
  eyebrow: string;
  title: string;
  statement?: string;
  support?: string;
  sectorLine?: string;
  bullets?: readonly string[];
  disclaimer?: string;
  children?: ReactNode;
  className?: string;
};

type FounderProofMicroProps = {
  mode: "micro";
  statement: string;
  className?: string;
};

export type FounderProofBlockProps =
  | FounderProofStripProps
  | FounderProofSectionProps
  | FounderProofMicroProps;

export function FounderProofBlock(props: FounderProofBlockProps) {
  if (props.mode === "micro") {
    return (
      <p
        data-proof-mode="micro"
        className={cn("max-w-3xl text-sm leading-7 text-muted-foreground", props.className)}
      >
        {props.statement}
      </p>
    );
  }

  if (props.mode === "strip") {
    return (
      <section
        data-proof-mode="strip"
        className={cn("section-band px-5 py-5 md:px-6 md:py-6", props.className)}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-8">
          <div className="space-y-2">
            <p className="enterprise-kicker">{props.eyebrow}</p>
            <p className="font-display max-w-[16ch] text-[1.6rem] font-semibold leading-[1.02] text-card-foreground md:text-[1.95rem]">
              Built in larger environments.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-base leading-8 text-card-foreground">{props.statement}</p>
            <p className="text-sm leading-7 text-muted-foreground">{props.support}</p>
            {props.sectorLine ? (
              <p className="table-kicker text-[rgb(var(--z-ink-label))]">{props.sectorLine}</p>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      data-proof-mode="section"
      className={cn("section-band px-5 py-5 md:px-6 md:py-6", props.className)}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:gap-8">
        <div className="space-y-3">
          <p className="enterprise-kicker">{props.eyebrow}</p>
          <h2 className="font-display max-w-[16ch] text-3xl font-semibold text-card-foreground md:text-[2.2rem] md:leading-[1.02]">
            {props.title}
          </h2>
        </div>

        <div className="space-y-4">
          {props.statement ? <p className="text-base leading-8 text-card-foreground">{props.statement}</p> : null}
          {props.support ? <p className="text-sm leading-7 text-muted-foreground">{props.support}</p> : null}
          {props.sectorLine ? (
            <p className="table-kicker text-[rgb(var(--z-ink-label))]">{props.sectorLine}</p>
          ) : null}
          {props.bullets?.length ? (
            <ul className="grid gap-3">
              {props.bullets.map((bullet) => (
                <li key={bullet} className="border-t border-border/70 pt-3 text-sm leading-7 text-card-foreground">
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
          {props.disclaimer ? (
            <p className="text-xs leading-6 text-muted-foreground">{props.disclaimer}</p>
          ) : null}
        </div>
      </div>

      {props.children ? <div className="mt-6 border-t border-border/70 pt-6">{props.children}</div> : null}
    </section>
  );
}
