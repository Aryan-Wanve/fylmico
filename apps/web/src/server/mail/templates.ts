import { getAppUrl, type MailMessage } from "./mailer";

function wrapper(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:32px;background:#f7f7fb;font-family:Helvetica,Arial,sans-serif;color:#11142c;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
      <p style="font-size:20px;font-weight:800;color:#654cff;margin:0 0 24px;">fylmico</p>
      <h1 style="font-size:20px;margin:0 0 12px;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top:32px;font-size:12px;color:#8a90a3;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#654cff;color:#ffffff;font-weight:700;text-decoration:none;border-radius:8px;">${label}</a>`;
}

export function buildVerificationEmail(to: string, token: string): MailMessage {
  const link = `${getAppUrl()}/verify-email?token=${encodeURIComponent(token)}`;

  return {
    to,
    subject: "Verify your Fylmico email address",
    html: wrapper(
      "Confirm your email address",
      `<p style="font-size:14px;color:#4b5268;">Welcome to Fylmico! Click the button below to verify your email address and finish setting up your account.</p>${button(link, "Verify email")}`
    ),
    text: `Welcome to Fylmico! Verify your email address: ${link}`
  };
}

export function buildPasswordResetEmail(
  to: string,
  token: string
): MailMessage {
  const link = `${getAppUrl()}/reset-password?token=${encodeURIComponent(token)}`;

  return {
    to,
    subject: "Reset your Fylmico password",
    html: wrapper(
      "Reset your password",
      `<p style="font-size:14px;color:#4b5268;">We received a request to reset your Fylmico password. This link expires in 1 hour.</p>${button(link, "Reset password")}`
    ),
    text: `Reset your Fylmico password (expires in 1 hour): ${link}`
  };
}
