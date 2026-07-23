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

function codeBlock(code: string): string {
  return `<p style="margin-top:16px;font-size:32px;font-weight:800;letter-spacing:0.35em;color:#654cff;">${code}</p>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#654cff;color:#ffffff;font-weight:700;text-decoration:none;border-radius:8px;">${label}</a>`;
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

export function buildJoinRequestEmail(
  to: string,
  requesterName: string,
  houseName: string
): MailMessage {
  const link = `${getAppUrl()}/dashboard`;

  return {
    to,
    subject: `${requesterName} wants to join ${houseName}`,
    html: wrapper(
      "New join request",
      `<p style="font-size:14px;color:#4b5268;">${requesterName} asked to join <strong>${houseName}</strong> on Fylmico. Review and approve or decline the request from your dashboard.</p>${button(link, "Review request")}`
    ),
    text: `${requesterName} asked to join ${houseName} on Fylmico. Review it at ${link}`
  };
}

export function buildClientReviewInviteEmail(
  to: string,
  options: {
    reviewToken: string;
    projectName?: string;
    videoTitle: string;
    version?: number;
    message?: string;
    deadline?: string;
  }
): MailMessage {
  const link = `${getAppUrl()}/review/${options.reviewToken}`;
  const projectLine = options.projectName
    ? `<p style="font-size:14px;color:#4b5268;margin:0 0 4px;"><strong>Project:</strong> ${options.projectName}</p>`
    : "";
  const versionLine = options.version
    ? `<p style="font-size:14px;color:#4b5268;margin:0 0 12px;"><strong>Version:</strong> v${options.version}</p>`
    : "";
  const messageLine = options.message
    ? `<p style="font-size:14px;color:#4b5268;margin:0 0 12px;">${options.message}</p>`
    : "";
  const deadlineLine = options.deadline
    ? `<p style="font-size:13px;color:#8a90a3;margin:12px 0 0;">Please review by ${options.deadline}.</p>`
    : "";

  return {
    to,
    subject: `${options.videoTitle} is ready for your review`,
    html: wrapper(
      "Your video is ready for review",
      `<p style="font-size:14px;color:#4b5268;">Hello,</p><p style="font-size:14px;color:#4b5268;">Your latest draft is ready for review.</p>${projectLine}<p style="font-size:14px;color:#4b5268;margin:0 0 4px;"><strong>Video:</strong> ${options.videoTitle}</p>${versionLine}${messageLine}${button(link, "Review Video")}${deadlineLine}<p style="margin-top:24px;font-size:12px;color:#8a90a3;">This secure link is intended only for: ${to}</p>`
    ),
    text: `Your latest draft (${options.videoTitle}${options.version ? `, v${options.version}` : ""}) is ready for review. Review it at ${link}. This secure link is intended only for ${to}.`
  };
}

export function buildReviewOtpEmail(to: string, code: string): MailMessage {
  return {
    to,
    subject: "Your Fylmico review access code",
    html: wrapper(
      "Confirm it's you",
      `<p style="font-size:14px;color:#4b5268;">Enter this code to access your video review. It expires in 10 minutes.</p>${codeBlock(code)}`
    ),
    text: `Your Fylmico review access code is ${code}. It expires in 10 minutes.`
  };
}
