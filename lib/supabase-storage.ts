import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getEnv } from "@/lib/env";

let cachedClient: SupabaseClient | null = null;

function resolveSupabaseUrl() {
  const env = getEnv();
  return env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabaseServiceClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const env = getEnv();
  const url = resolveSupabaseUrl();

  if (!url || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_STORAGE_NOT_CONFIGURED");
  }

  cachedClient = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}

export async function createSignedArtifactUpload(input: {
  bucket: string;
  path: string;
}) {
  const client = getSupabaseServiceClient();

  const { data, error } = await client.storage.from(input.bucket).createSignedUploadUrl(input.path);

  if (error || !data) {
    throw new Error(error?.message ?? "FAILED_TO_CREATE_SIGNED_UPLOAD_URL");
  }

  return data;
}
