export function getSiteOriginFromRequest(request: Request): string {
  const fallback = new URL(request.url).origin;
  const candidates = [
    process.env.APP_SITE_URL,
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ];

  for (const raw of candidates) {
    if (!raw) {
      continue;
    }

    const cleaned = raw.replaceAll("\\n", "").replaceAll("\\r", "").trim();
    if (!cleaned) {
      continue;
    }

    try {
      return new URL(cleaned).origin;
    } catch {
      continue;
    }
  }

  return fallback;
}
