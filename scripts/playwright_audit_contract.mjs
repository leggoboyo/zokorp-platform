export const MARKETING_ROUTE_EXPECTATIONS = [
  {
    path: "/",
    label: "Homepage",
    marker: "AWS architecture review, remediation, and software for teams that need a credible next step.",
  },
  {
    path: "/services",
    label: "Services",
    marker: "Architecture review first. Remediation, readiness, and implementation when the next step is real.",
  },
  {
    path: "/about",
    label: "About",
    marker: "Built by a technical founder who has spent time inside AWS, Microsoft, and real delivery work.",
  },
  {
    path: "/contact",
    label: "Contact",
    marker: "Start the right conversation without getting pushed into signup first.",
  },
  {
    path: "/pricing",
    label: "Pricing",
    marker: "Public price anchors for consulting, and straightforward pricing for the software that is ready.",
  },
  {
    path: "/software",
    label: "Software",
    marker: "Software that supports the consulting model instead of pretending to replace it.",
  },
  {
    path: "/media",
    label: "Insights",
    marker: "Guides, notes, and operating perspectives",
  },
  {
    path: "/privacy",
    label: "Privacy",
    marker: "Privacy overview",
  },
  {
    path: "/terms",
    label: "Terms",
    marker: "Platform terms",
  },
  {
    path: "/refunds",
    label: "Refunds",
    marker: "Refund posture",
  },
  {
    path: "/security",
    label: "Security",
    marker: "Current platform security posture",
  },
  {
    path: "/support",
    label: "Support",
    marker: "Support lives with the platform",
  },
];

export const APP_ROUTE_EXPECTATIONS = [
  {
    path: "/login",
    label: "Login",
    marker: "Sign in",
  },
  {
    path: "/register",
    label: "Register",
    marker: "Create account",
  },
  {
    path: "/software",
    label: "Software hub",
    marker: "Software that supports the consulting model instead of pretending to replace it.",
  },
  {
    path: "/software/architecture-diagram-reviewer/sample-report",
    label: "Architecture reviewer sample report",
    marker: "Architecture Diagram Reviewer Sample Report",
  },
];

export const APP_PRODUCT_EXPECTATIONS = [
  {
    slug: "architecture-diagram-reviewer",
    label: "Architecture Diagram Reviewer",
    path: "/software/architecture-diagram-reviewer",
    titleMarker: "Architecture Diagram Reviewer",
    publicMarkers: [
      "Verified business-email account required",
      "Sign in with your verified business email before running this diagnostic.",
    ],
    authenticatedMarkers: [
      "Architecture Description (required)",
    ],
  },
  {
    slug: "zokorp-validator",
    label: "ZoKorpValidator",
    path: "/software/zokorp-validator",
    titleMarker: "ZoKorpValidator",
    publicMarkers: [
      "Sign in first",
      "Sign in first, then purchase the correct tier to unlock this tool.",
    ],
    authenticatedMarkers: [
      "Run ZoKorpValidator",
    ],
  },
  {
    slug: "mlops-foundation-platform",
    label: "ZoKorp Forecasting Beta",
    path: "/software/mlops-foundation-platform",
    titleMarker: "ZoKorp Forecasting Beta",
    publicMarkers: [
      "Forecasting beta only",
      "Subscription required",
    ],
    authenticatedMarkers: [
      "Subscription required",
      "Active subscription",
    ],
  },
];

export const LEGACY_REDIRECT_EXPECTATIONS = [
  {
    from: "/about-us",
    to: "/about",
  },
  {
    from: "/our-services",
    to: "/services",
  },
  {
    from: "/contact-us",
    to: "/contact",
  },
  {
    from: "/blog",
    to: "/media",
  },
  {
    from: "/blog/example-post",
    to: "/media",
  },
  {
    from: "/case-studies",
    to: "/about",
  },
];

export const MARKETING_PRIMARY_NAV_LABELS = ["Services", "Software", "Pricing", "About", "Contact"];
export const MARKETING_MORE_MENU_LABELS = ["Insights", "Support"];
export const FOOTER_LEGAL_LINK_LABELS = ["Security", "Privacy", "Refunds", "Terms", "Support"];

export const CONSULTING_PRICE_MARKERS = [
  "$249",
  "from $1,250",
  "from $2,500",
  "from $3,500",
  "Custom quote",
];
