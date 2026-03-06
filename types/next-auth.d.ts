import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    passwordUpdatedAt?: number;
    authError?: "EMAIL_NOT_VERIFIED" | "SESSION_INVALIDATED";
  }
}
