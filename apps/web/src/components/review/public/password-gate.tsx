"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyReviewPassword } from "@/services/review-session-public.service";

export function PasswordGate({
  token,
  onVerified
}: {
  token: string;
  onVerified: () => void;
}) {
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!password) {
      setError("Enter the password for this review link.");
      return;
    }
    setChecking(true);
    setError("");
    try {
      await verifyReviewPassword(token, password);
      onVerified();
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "That password is incorrect."
      );
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-3xl border border-black/[0.06] bg-white p-8 text-center shadow-[0_1.5rem_5rem_rgba(53,45,124,0.08)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <h1 className="text-xl font-black text-[#11142c] dark:text-[#f1f2f8]">
        Password protected
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
        This review is password protected. Enter the password you were given to
        continue.
      </p>

      <div className="mt-6 grid gap-2.5">
        <Input
          autoFocus
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void handleSubmit();
          }}
          placeholder="Password"
          type="password"
          value={password}
        />
        <Button
          className="h-11 w-full"
          disabled={checking}
          onClick={() => void handleSubmit()}
        >
          {checking ? "Checking..." : "Continue"}
        </Button>
      </div>

      {error ? (
        <p className="mt-4 text-sm font-semibold text-red-500">{error}</p>
      ) : null}
    </div>
  );
}
