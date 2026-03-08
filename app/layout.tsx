import type { Metadata } from "next";
import localFont from "next/font/local";

import { GoogleAnalytics } from "@/components/google-analytics";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl, siteConfig } from "@/lib/site";

import "./globals.css";

const plusJakarta = localFont({
  variable: "--font-plus-jakarta",
  display: "swap",
  src: [
    {
      path: "./fonts/PlusJakartaSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/PlusJakartaSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/PlusJakartaSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/PlusJakartaSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

const spaceGrotesk = localFont({
  variable: "--font-space-grotesk",
  display: "swap",
  src: [
    {
      path: "./fonts/SpaceGrotesk-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/SpaceGrotesk-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/SpaceGrotesk-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/SpaceGrotesk-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

const jetBrainsMono = localFont({
  variable: "--font-jetbrains-mono",
  display: "swap",
  src: [
    {
      path: "./fonts/JetBrainsMono-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/JetBrainsMono-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/JetBrainsMono-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteConfig.platformName,
    template: `%s | ${siteConfig.platformName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.platformName,
  referrer: "strict-origin-when-cross-origin",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.platformName,
    description: siteConfig.description,
    siteName: siteConfig.platformName,
    url: getSiteUrl(),
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.platformName,
    description: siteConfig.description,
    images: ["/twitter-image"],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION
      ? {
          "msvalidate.01": process.env.BING_SITE_VERIFICATION,
        }
      : undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} bg-background text-foreground antialiased`}
      >
        <GoogleAnalytics />
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6 md:py-10">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
