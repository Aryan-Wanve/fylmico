"use client";

import { useState } from "react";
import { MailWarning } from "lucide-react";
import { resendVerificationEmail } from "@/services/base-workspace.service";

export function VerifyEmailBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (dismissed) {
    return null;
  }

  async function handleResend() {
    setSending(true);
    try {
      await resendVerificationEmail();
      setSent(true);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not resend the verification email."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 bg-amber-500/10 px-8 py-2.5 text-sm">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
        <MailWarning className="h-4 w-4 shrink-0" />
        <span className="font-semibold">
          {sent
            ? "Verification email sent — check your inbox."
            : "Please verify your email address to secure your account."}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {!sent ? (
          <button
            className="font-bold text-amber-800 underline hover:no-underline disabled:opacity-60 dark:text-amber-300"
            disabled={sending}
            onClick={handleResend}
            type="button"
          >
            {sending ? "Sending..." : "Resend email"}
          </button>
        ) : null}
        <button
          className="font-semibold text-amber-800/70 hover:text-amber-800 dark:text-amber-300/70 dark:hover:text-amber-300"
          onClick={() => setDismissed(true)}
          type="button"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
