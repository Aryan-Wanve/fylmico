import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getOptionalEnv } from "../env";
import { AppException, HttpStatus } from "../http";

const BUCKET = getOptionalEnv("SUPABASE_STORAGE_BUCKET") ?? "fylmico-files";
const SIGNED_URL_TTL_SECONDS = 60 * 10;

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) {
    return client;
  }

  const url = getOptionalEnv("SUPABASE_URL");
  const serviceRoleKey = getOptionalEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    throw new AppException(
      HttpStatus.SERVICE_UNAVAILABLE,
      "storage_not_configured",
      "File storage is not configured on this server."
    );
  }

  client = createClient(url, serviceRoleKey);
  return client;
}

export async function uploadObject(
  path: string,
  body: ArrayBuffer,
  contentType: string
): Promise<void> {
  const { error } = await getClient()
    .storage.from(BUCKET)
    .upload(path, body, { contentType, upsert: false });

  if (error) {
    throw new AppException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "storage_upload_failed",
      `Could not upload the file: ${error.message}`
    );
  }
}

export async function deleteObjects(paths: string[]): Promise<void> {
  if (paths.length === 0) {
    return;
  }

  const { error } = await getClient().storage.from(BUCKET).remove(paths);
  if (error) {
    throw new AppException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "storage_delete_failed",
      `Could not delete the file: ${error.message}`
    );
  }
}

export async function getSignedDownloadUrl(path: string): Promise<string> {
  const { data, error } = await getClient()
    .storage.from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    throw new AppException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "storage_signed_url_failed",
      `Could not generate a download link: ${error?.message ?? "unknown error"}`
    );
  }

  return data.signedUrl;
}

// Avatars need to render inline everywhere (topbar, sidebar, etc.) without
// re-fetching a signed URL on every render, so they're served from a public
// path instead - the bucket's "avatars/" prefix must have a public read
// policy configured in Supabase for this URL to actually resolve.
export function getPublicUrl(path: string): string {
  return getClient().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
