import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  EMAIL_SERVER_HOST: z.string().min(1),
  EMAIL_SERVER_PORT: z.coerce.number().int().positive(),
  EMAIL_SERVER_USER: z.string().min(1),
  EMAIL_SERVER_PASSWORD: z.string().min(1),
  EMAIL_FROM: z.string().email(),

  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),

  ZOKORP_ADMIN_EMAILS: z.string().optional(),
  UPLOAD_MAX_MB: z.coerce.number().int().positive().default(10),

  STRIPE_PRICE_ID_FTR_SINGLE: z.string().optional(),
  STRIPE_PRICE_ID_SDP_SRP_SINGLE: z.string().optional(),
  STRIPE_PRICE_ID_COMPETENCY_REVIEW: z.string().optional(),
  STRIPE_PRICE_ID_PLATFORM_MONTHLY: z.string().optional(),
  STRIPE_PRICE_ID_PLATFORM_ANNUAL: z.string().optional(),

  SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  STRIPE_PRICE_ID_MLOPS_STARTER_MONTHLY: z.string().optional(),
  STRIPE_PRICE_ID_MLOPS_STARTER_ANNUAL: z.string().optional(),
  STRIPE_METER_EVENT_NAME_JOB_UNITS: z.string().optional(),

  MLOPS_DEFAULT_ORG_SLUG: z.string().optional(),
  MLOPS_RUNNER_KEY_PEPPER: z.string().optional(),
  MLOPS_ARTIFACT_BUCKET: z.string().default("mlops-artifacts"),
});

let cachedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`Invalid environment variables: ${parsed.error.message}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
