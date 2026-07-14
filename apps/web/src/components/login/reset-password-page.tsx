"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, KeyRound, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/login/auth-layout";
import { AuthSecurityNote } from "@/components/login/auth-security-note";
import { resetPassword } from "@/services/base-workspace.service";

export function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const code = String(form.get("code") ?? "").trim();
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({ email, code, newPassword });
      setIsSubmitted(true);
      window.setTimeout(() => router.push("/login"), 1800);
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Something went wrong."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[27rem] rounded-2xl border border-black/[0.06] bg-white p-8 shadow-[0_1.8rem_5rem_rgba(55,48,120,0.12)] dark:border-white/[0.08] dark:bg-[#171a28]"
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <header>
          <h2 className="text-[1.85rem] font-black text-[#11142c] dark:text-[#f1f2f8]">
            Choose a new password
          </h2>
          <p className="mt-2 font-semibold text-[#75798a] dark:text-[#8b8fa3]">
            Enter the code from your email and a new password.
          </p>
        </header>

        {isSubmitted ? (
          <p className="mt-7 rounded-lg border border-green-200 bg-green-50 px-3.5 py-3 text-sm font-semibold text-green-700">
            Password updated. Redirecting you to log in...
          </p>
        ) : (
          <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label
                className="text-[0.86rem] font-extrabold text-[#15172b] dark:text-[#f1f2f8]"
                htmlFor="reset-email"
              >
                Email address
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-[#8a8e9e] dark:text-[#7d8299]" />
                <Input
                  autoComplete="email"
                  className="h-[3.55rem] rounded-lg border-[#11142c1c] pl-11 text-[#15172b] shadow-[0_0.65rem_1.6rem_rgba(42,39,84,0.04)] placeholder:font-semibold placeholder:text-[#9296a4] focus-visible:border-[#654cff8c] focus-visible:ring-[#654cff1a] dark:text-[#f1f2f8] dark:placeholder:text-[#7d8299]"
                  defaultValue={searchParams.get("email") ?? ""}
                  id="reset-email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  type="email"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label
                className="text-[0.86rem] font-extrabold text-[#15172b] dark:text-[#f1f2f8]"
                htmlFor="reset-code"
              >
                Reset code
              </Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-[#8a8e9e] dark:text-[#7d8299]" />
                <Input
                  autoComplete="one-time-code"
                  className="h-[3.55rem] rounded-lg border-[#11142c1c] pl-11 text-[#15172b] shadow-[0_0.65rem_1.6rem_rgba(42,39,84,0.04)] placeholder:font-semibold placeholder:text-[#9296a4] focus-visible:border-[#654cff8c] focus-visible:ring-[#654cff1a] dark:text-[#f1f2f8] dark:placeholder:text-[#7d8299]"
                  id="reset-code"
                  inputMode="numeric"
                  maxLength={6}
                  name="code"
                  placeholder="123456"
                  required
                  type="text"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label
                className="text-[0.86rem] font-extrabold text-[#15172b] dark:text-[#f1f2f8]"
                htmlFor="reset-new-password"
              >
                New password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-[#8a8e9e] dark:text-[#7d8299]" />
                <Input
                  autoComplete="new-password"
                  className="h-[3.55rem] rounded-lg border-[#11142c1c] pr-11 pl-11 text-[#15172b] shadow-[0_0.65rem_1.6rem_rgba(42,39,84,0.04)] placeholder:font-semibold placeholder:text-[#9296a4] focus-visible:border-[#654cff8c] focus-visible:ring-[#654cff1a] dark:text-[#f1f2f8] dark:placeholder:text-[#7d8299]"
                  id="reset-new-password"
                  name="newPassword"
                  placeholder="Create a new password"
                  type={isPasswordVisible ? "text" : "password"}
                />
                <button
                  aria-label={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#8a8e9e] dark:text-[#7d8299]"
                  onClick={() => setIsPasswordVisible((value) => !value)}
                  type="button"
                >
                  {isPasswordVisible ? (
                    <EyeOff className="h-[1.1rem] w-[1.1rem]" />
                  ) : (
                    <Eye className="h-[1.1rem] w-[1.1rem]" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label
                className="text-[0.86rem] font-extrabold text-[#15172b] dark:text-[#f1f2f8]"
                htmlFor="reset-confirm-password"
              >
                Confirm password
              </Label>
              <Input
                autoComplete="new-password"
                className="h-[3.55rem] rounded-lg border-[#11142c1c] px-4 text-[#15172b] shadow-[0_0.65rem_1.6rem_rgba(42,39,84,0.04)] placeholder:font-semibold placeholder:text-[#9296a4] focus-visible:border-[#654cff8c] focus-visible:ring-[#654cff1a] dark:text-[#f1f2f8] dark:placeholder:text-[#7d8299]"
                id="reset-confirm-password"
                name="confirmPassword"
                placeholder="Re-enter your new password"
                type={isPasswordVisible ? "text" : "password"}
              />
            </div>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-600">
                {error}
              </p>
            ) : null}

            <Button
              className="h-[3.25rem] w-full rounded-lg bg-gradient-to-br from-[#654cff] to-[#5b3ff0] text-base font-bold text-white shadow-[0_1rem_2.1rem_rgba(101,76,255,0.28)] hover:opacity-95"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        <p className="mt-5 text-center text-[0.9rem] font-semibold text-[#6d7080] dark:text-[#8b8fa3]">
          Remembered your password?{" "}
          <Link className="font-extrabold text-[#654cff]" href="/login">
            Log in
          </Link>
        </p>
      </motion.section>

      <AuthSecurityNote />
    </AuthLayout>
  );
}
