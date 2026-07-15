import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

// Browser-side client for Realtime only (Broadcast/Presence channels) - no
// table access, so the public anon key is fine to ship to the client.
// Returns null (rather than throwing) when unconfigured so realtime
// features degrade to "no live updates" instead of crashing the page.
export function getRealtimeClient(): SupabaseClient | null {
  if (client !== undefined) {
    return client;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && anonKey ? createClient(url, anonKey) : null;
  return client;
}
