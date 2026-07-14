import type { MailMessage } from "./mailer";

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

function codeBlock(code: string): string {
  return `<p style="margin-top:16px;font-size:32px;font-weight:800;letter-spacing:0.35em;color:#654cff;">${code}</p>`;
}

export function buildVerificationEmail(to: string, code: string): MailMessage {
  return {
    to,
    subject: "Verify your Fylmico email address",
    html: wrapper(
      "Confirm your email address",
      `<p style="font-size:14px;color:#4b5268;">Welcome to Fylmico! Enter this code to verify your email address. It expires in 10 minutes.</p>${codeBlock(code)}`
    ),
    text: `Your Fylmico verification code is ${code}. It expires in 10 minutes.`
  };
}

export function buildPasswordResetEmail(to: string, code: string): MailMessage {
  return {
    to,
    subject: "Reset your Fylmico password",
    html: wrapper(
      "Reset your password",
      `<p style="font-size:14px;color:#4b5268;">We received a request to reset your Fylmico password. Enter this code to continue. It expires in 10 minutes.</p>${codeBlock(code)}`
    ),
    text: `Your Fylmico password reset code is ${code}. It expires in 10 minutes.`
  };
}
