const DEFAULT_AUTH_CALLBACK_PATH = "/account";

type SanitizeOptions = {
  fallbackPath?: string;
};

export function sanitizeAuthCallbackUrl(raw: string | undefined, options: SanitizeOptions = {}): string {
  const fallbackPath = options.fallbackPath ?? DEFAULT_AUTH_CALLBACK_PATH;
  if (!raw) {
    return fallbackPath;
  }

  const candidate = raw.trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) {
    return fallbackPath;
  }

  try {
    const decoded = decodeURIComponent(candidate);
    if (decoded.startsWith("//") || decoded.includes("\\")) {
      return fallbackPath;
    }
  } catch {
    // Keep processing original candidate when decoding fails.
  }

  try {
    const parsed = new URL(candidate, "https://zokorp.local");
    if (parsed.origin !== "https://zokorp.local") {
      return fallbackPath;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallbackPath;
  }
}

export function resolveAuthRedirectUrl(url: string, baseUrl: string): string {
  const fallback = new URL(DEFAULT_AUTH_CALLBACK_PATH, baseUrl).toString();

  if (url.startsWith("/")) {
    const safePath = sanitizeAuthCallbackUrl(url, { fallbackPath: DEFAULT_AUTH_CALLBACK_PATH });
    return new URL(safePath, baseUrl).toString();
  }

  try {
    const target = new URL(url);
    const baseOrigin = new URL(baseUrl).origin;
    if (target.origin !== baseOrigin) {
      return fallback;
    }

    const safePath = sanitizeAuthCallbackUrl(`${target.pathname}${target.search}${target.hash}`, {
      fallbackPath: DEFAULT_AUTH_CALLBACK_PATH,
    });
    return new URL(safePath, baseUrl).toString();
  } catch {
    return fallback;
  }
}
