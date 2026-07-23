"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  requestReviewOtp,
  verifyReviewOtp
} from "@/services/review-session-public.service";

const MAX_OTP_ATTEMPTS = 5;

export function OtpGate({
  token,
  clientEmailMasked,
  onVerified
}: {
  token: string;
  clientEmailMasked: string;
  onVerified: () => void;
}) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  async function handleSendCode() {
    setSending(true);
    setError("");
    try {
      await requestReviewOtp(token);
      setSent(true);
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Could not send an access code. Try again."
      );
    } finally {
      setSending(false);
    }
  }

  async function handleVerify() {
    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setVerifying(true);
    setError("");
    try {
      await verifyReviewOtp(token, code.trim());
      onVerified();
    } catch (verifyError) {
      setAttempts((current) => current + 1);
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "That code is incorrect."
      );
    } finally {
      setVerifying(false);
    }
  }

  const lockedOut = attempts >= MAX_OTP_ATTEMPTS;

  return (
    <div className="w-full max-w-sm rounded-3xl border border-black/[0.06] bg-white p-8 text-center shadow-[0_1.5rem_5rem_rgba(53,45,124,0.08)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <h1 className="text-xl font-black text-[#11142c] dark:text-[#f1f2f8]">
        Confirm it&apos;s you
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
        We&apos;ll email a one-time access code to{" "}
        <strong className="text-[#11142c] dark:text-[#f1f2f8]">
          {clientEmailMasked}
        </strong>
        .
      </p>

      {lockedOut ? (
        <p className="mt-6 text-sm font-semibold text-red-500">
          Too many incorrect attempts. Request a new code to try again.
        </p>
      ) : !sent ? (
        <Button
          className="mt-6 h-11 w-full"
          disabled={sending}
          onClick={() => void handleSendCode()}
        >
          {sending ? "Sending..." : "Send access code"}
        </Button>
      ) : (
        <div className="mt-6 grid gap-2.5">
          <input
            autoFocus
            className="h-12 w-full rounded-lg border border-black/10 bg-transparent text-center text-lg font-bold tracking-[0.4em] text-[#11142c] outline-none focus:border-[var(--fylmico-accent)] dark:border-white/10 dark:text-[#f1f2f8]"
            inputMode="numeric"
            maxLength={6}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            onKeyDown={(event) => {
              if (event.key === "Enter") void handleVerify();
            }}
            placeholder="000000"
            value={code}
          />
          <Button
            className="h-11 w-full"
            disabled={verifying}
            onClick={() => void handleVerify()}
          >
            {verifying ? "Verifying..." : "Verify code"}
          </Button>
          <button
            className="text-xs font-semibold text-[var(--fylmico-accent)] hover:underline"
            onClick={() => void handleSendCode()}
            type="button"
          >
            Resend code
          </button>
        </div>
      )}

      {error ? (
        <p className="mt-4 text-sm font-semibold text-red-500">{error}</p>
      ) : null}
    </div>
  );
}
