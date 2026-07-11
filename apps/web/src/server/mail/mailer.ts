import { getEnv, getOptionalEnv } from "../env";

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// No email provider is required for local development - without a
// RESEND_API_KEY, emails are logged to the console instead of failing the
// request, the same fallback pattern used for Google OAuth/Supabase Storage
// when their env vars are unset.
export async function sendMail(message: MailMessage): Promise<void> {
  const apiKey = getOptionalEnv("RESEND_API_KEY");

  if (!apiKey) {
    console.log(
      `[mailer] RESEND_API_KEY not configured - logging email instead of sending.\nTo: ${message.to}\nSubject: ${message.subject}\n${message.text}`
    );
    return;
  }

  const from = getEnv("MAIL_FROM", "Fylmico <onboarding@resend.dev>");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text
    })
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[mailer] Resend send failed (${response.status}): ${body}`);
  }
}

export function getAppUrl(): string {
  return getEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
}
