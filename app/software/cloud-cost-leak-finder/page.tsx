import { type Metadata } from "next";

import { CloudCostLeakFinderForm } from "@/components/cloud-cost-leak-finder/CloudCostLeakFinderForm";
import { buildPageMetadata } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Cloud Cost Leak Finder",
  description:
    "Free deterministic cloud cost diagnostic for SMB teams with emailed findings, likely savings range, and a consulting quote.",
  path: "/software/cloud-cost-leak-finder",
});

export default function CloudCostLeakFinderPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <CloudCostLeakFinderForm />
    </div>
  );
}
