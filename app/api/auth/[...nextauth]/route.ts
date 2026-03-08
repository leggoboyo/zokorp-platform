import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth";
import { consumeRateLimit, getRequestFingerprint } from "@/lib/rate-limit";

const handler = NextAuth(authOptions);
type NextAuthRouteContext = {
  params: Promise<{ nextauth: string[] }>;
};

export function GET(request: Request, context: NextAuthRouteContext) {
  return handler(request, context);
}

export async function POST(request: Request, context: NextAuthRouteContext) {
  const pathname = new URL(request.url).pathname;
  if (pathname.endsWith("/callback/credentials") || pathname.endsWith("/signin/credentials")) {
    const limiter = await consumeRateLimit({
      key: `auth:password:${getRequestFingerprint(request)}`,
      limit: 25,
      windowMs: 10 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many login attempts. Please wait before retrying." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(limiter.retryAfterSeconds),
          },
        },
      );
    }
  }

  return handler(request, context);
}
