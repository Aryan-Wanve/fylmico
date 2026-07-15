import { getOptionalEnv } from "../env";

// Server -> client push via Supabase Realtime's broadcast REST endpoint
// (not the websocket client - a plain POST needs no persistent connection
// from a stateless route handler, matching how mailer.ts calls Resend).
// Degrades to a no-op if Realtime isn't configured, same fallback pattern
// as the mailer/storage modules when their env vars are unset.
export async function broadcast(
  topic: string,
  event: string,
  payload: unknown
): Promise<void> {
  const url = getOptionalEnv("SUPABASE_URL");
  const serviceRoleKey = getOptionalEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    return;
  }

  const response = await fetch(`${url}/realtime/v1/api/broadcast`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ messages: [{ topic, event, payload }] })
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[realtime] broadcast failed (${response.status}): ${body}`);
  }
}

export function conversationTopic(conversationId: string): string {
  return `conversation:${conversationId}`;
}

export function houseChatTopic(organizationId: string): string {
  return `house:${organizationId}:chat`;
}

export function housePresenceTopic(organizationId: string): string {
  return `house:${organizationId}:presence`;
}
