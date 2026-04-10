import { NextResponse } from "next/server";

import { getSiteOriginFromRequest } from "@/lib/site-origin";

export const CROSS_SITE_REQUEST_ERROR = "Cross-site requests are not allowed.";

function normalizeOriginValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).origin;
  } catch {
    return null;
  }
}

function isLoopbackOrigin(origin: string | null | undefined) {
  if (!origin) {
    return false;
  }

  try {
    const url = new URL(origin);
    return url.hostname === "127.0.0.1" || url.hostname === "localhost";
  } catch {
    return false;
  }
}

function firstHeaderValue(value: string | null | undefined) {
  return value?.split(",")[0]?.trim() ?? null;
}

function loopbackAliases(origin: string) {
  try {
    const url = new URL(origin);

    if (url.hostname === "127.0.0.1") {
      return [normalizeOriginValue(`${url.protocol}//localhost${url.port ? `:${url.port}` : ""}`)].filter(
        (value): value is string => Boolean(value),
      );
    }

    if (url.hostname === "localhost") {
      return [normalizeOriginValue(`${url.protocol}//127.0.0.1${url.port ? `:${url.port}` : ""}`)].filter(
        (value): value is string => Boolean(value),
      );
    }
  } catch {
    return [];
  }

  return [];
}

function addTrustedOrigin(origins: Set<string>, candidate: string | null) {
  if (!candidate) {
    return;
  }

  origins.add(candidate);
  for (const alias of loopbackAliases(candidate)) {
    origins.add(alias);
  }
}

function hostHeaderOrigin(request: Request) {
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const host = forwardedHost || firstHeaderValue(request.headers.get("host"));

  if (!host) {
    return null;
  }

  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));

  try {
    const requestUrl = new URL(request.url);
    const protocol = forwardedProto || requestUrl.protocol.replace(/:$/, "");
    return normalizeOriginValue(`${protocol}://${host}`);
  } catch {
    return null;
  }
}

function trustedRequestOrigins(request: Request) {
  const origins = new Set<string>();

  try {
    addTrustedOrigin(origins, new URL(request.url).origin);
  } catch {
    // Ignore malformed runtime URL values and rely on configured site origin below.
  }

  const headerOrigin = hostHeaderOrigin(request);
  addTrustedOrigin(origins, headerOrigin);

  addTrustedOrigin(origins, getSiteOriginFromRequest(request));
  return origins;
}

export function extractRequestOrigin(request: Request) {
  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");

  if (originHeader !== null) {
    return {
      present: true,
      origin: normalizeOriginValue(originHeader),
    };
  }

  if (refererHeader !== null) {
    return {
      present: true,
      origin: normalizeOriginValue(refererHeader),
    };
  }

  return {
    present: false,
    origin: null,
  };
}

export function requireSameOrigin(request: Request) {
  const source = extractRequestOrigin(request);
  if (!source.present || !source.origin) {
    return NextResponse.json(
      { error: CROSS_SITE_REQUEST_ERROR },
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  if (process.env.NODE_ENV !== "production" && isLoopbackOrigin(source.origin)) {
    return null;
  }

  if (!trustedRequestOrigins(request).has(source.origin)) {
    return NextResponse.json(
      { error: CROSS_SITE_REQUEST_ERROR },
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return null;
}
