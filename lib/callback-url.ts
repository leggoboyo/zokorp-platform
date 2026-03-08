const DEFAULT_CALLBACK_URL = "/account";

export function sanitizeCallbackUrl(raw: string | undefined, fallback = DEFAULT_CALLBACK_URL) {
  if (!raw) {
    return fallback;
  }

  const value = raw.trim();
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/")) {
    return fallback;
  }

  if (/[\r\n\t]/.test(value)) {
    return fallback;
  }

  if (value.includes("\\")) {
    return fallback;
  }

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }

  if (decoded.startsWith("//") || decoded.startsWith("/\\") || decoded.includes("\\")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://zokorp.local");
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function sanitizeAuthRedirectTarget(url: string, baseUrl: string, fallback = DEFAULT_CALLBACK_URL) {
  const fallbackPath = sanitizeCallbackUrl(fallback, DEFAULT_CALLBACK_URL);
  const fallbackAbsolute = new URL(fallbackPath, baseUrl).toString();

  try {
    const target = new URL(url, baseUrl);
    const baseOrigin = new URL(baseUrl).origin;
    if (target.origin !== baseOrigin) {
      return fallbackAbsolute;
    }

    const relativeTarget = `${target.pathname}${target.search}${target.hash}`;
    const safeTarget = sanitizeCallbackUrl(relativeTarget, fallbackPath);
    return new URL(safeTarget, baseUrl).toString();
  } catch {
    return fallbackAbsolute;
  }
}

export { DEFAULT_CALLBACK_URL };
