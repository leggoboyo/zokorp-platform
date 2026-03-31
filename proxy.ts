import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const REDIRECT_HOSTS = new Set(["zokorp.com", "www.zokorp.com"]);
const CANONICAL_APP_HOST = "app.zokorp.com";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.trim().toLowerCase();

  if (!host || !REDIRECT_HOSTS.has(host)) {
    return NextResponse.next();
  }

  const destination = request.nextUrl.clone();
  destination.protocol = "https:";
  destination.host = CANONICAL_APP_HOST;

  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: ["/:path*"],
};
