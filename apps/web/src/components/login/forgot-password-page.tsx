"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/login/auth-layout";
import { AuthSecurityNote } from "@/components/login/auth-security-note";
import { requestPasswordReset } from "@/services/base-workspace.service";

export function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();

    setError("");
    setIsSubmitting(true);

    try {
      await requestPasswordReset({ email });
      setIsSubmitted(true);
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Something went wrong."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[27rem] rounded-2xl border border-black/[0.06] bg-white p-8 shadow-[0_1.8rem_5rem_rgba(55,48,120,0.12)]"
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <header>
          <h2 className="text-[1.85rem] font-black text-[#11142c]">
            Reset your password
          </h2>
          <p className="mt-2 font-semibold text-[#75798a]">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </header>

        {isSubmitted ? (
          <div className="mt-7 grid gap-4">
            <p className="rounded-lg border border-[#654cff33] bg-[#654cff0d] px-3.5 py-3 text-sm font-semibold text-[#4a3bd1]">
              If an account exists for that email, a reset link is on its way.
              Check your inbox.
            </p>
            <p className="text-center text-[0.9rem] font-semibold text-[#6d7080]">
              Already have a reset code?{" "}
              <Link
                className="font-extrabold text-[#654cff]"
                href="/reset-password"
              >
                Enter it here
              </Link>
            </p>
          </div>
        ) : (
          <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label
                className="text-[0.86rem] font-extrabold text-[#15172b]"
                htmlFor="forgot-email"
              >
                Email address
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-[#8a8e9e]" />
                <Input
                  autoComplete="email"
                  className="h-[3.55rem] rounded-lg border-[#11142c1c] pl-11 text-[#15172b] shadow-[0_0.65rem_1.6rem_rgba(42,39,84,0.04)] placeholder:font-semibold placeholder:text-[#9296a4] focus-visible:border-[#654cff8c] focus-visible:ring-[#654cff1a]"
                  id="forgot-email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  type="email"
                />
              </div>
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
              {isSubmitting ? "Sending..." : "Send Reset Link"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        <p className="mt-5 text-center text-[0.9rem] font-semibold text-[#6d7080]">
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
