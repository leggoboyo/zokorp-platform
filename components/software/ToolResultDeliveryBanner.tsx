import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ToolResultDeliveryBannerProps = {
  tone?: "success" | "info" | "warning" | "danger" | "neutral";
  title: string;
  description: string;
  detail?: string | null;
  children?: ReactNode;
};

export function ToolResultDeliveryBanner({
  tone = "info",
  title,
  description,
  detail,
  children,
}: ToolResultDeliveryBannerProps) {
  return (
    <Alert tone={tone}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p>{description}</p>
          {detail ? <p className="text-xs leading-5 text-current/80">{detail}</p> : null}
          {children ? <div className="pt-1">{children}</div> : null}
        </div>
      </AlertDescription>
    </Alert>
  );
}
