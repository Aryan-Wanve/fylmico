"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/login/auth-layout";
import { AuthSocialProviders } from "@/components/login/auth-social-providers";
import { AuthSecurityNote } from "@/components/login/auth-security-note";

export function SignupPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice("");

    window.setTimeout(() => {
      setIsSubmitting(false);
      setNotice(
        "Sign up isn't open yet in this preview. Ask your house owner for an invite instead."
      );
    }, 500);
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
            Create your account
          </h2>
          <p className="mt-2 font-semibold text-[#75798a]">
            Start planning your next production with Fylmico
          </p>
        </header>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label
              className="text-[0.86rem] font-extrabold text-[#15172b]"
              htmlFor="signup-name"
            >
              Full name
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute top-1/2 left-3.5 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-[#8a8e9e]" />
              <Input
                autoComplete="name"
                className="h-[3.55rem] rounded-lg border-[#11142c1c] pl-11 text-[#15172b] shadow-[0_0.65rem_1.6rem_rgba(42,39,84,0.04)] placeholder:font-semibold placeholder:text-[#9296a4] focus-visible:border-[#654cff8c] focus-visible:ring-[#654cff1a]"
                id="signup-name"
                name="name"
                placeholder="Enter your full name"
                type="text"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label
              className="text-[0.86rem] font-extrabold text-[#15172b]"
              htmlFor="signup-email"
            >
              Email address
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-[#8a8e9e]" />
              <Input
                autoComplete="email"
                className="h-[3.55rem] rounded-lg border-[#11142c1c] pl-11 text-[#15172b] shadow-[0_0.65rem_1.6rem_rgba(42,39,84,0.04)] placeholder:font-semibold placeholder:text-[#9296a4] focus-visible:border-[#654cff8c] focus-visible:ring-[#654cff1a]"
                id="signup-email"
                name="email"
                placeholder="Enter your email"
                type="email"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label
              className="text-[0.86rem] font-extrabold text-[#15172b]"
              htmlFor="signup-password"
            >
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-[#8a8e9e]" />
              <Input
                autoComplete="new-password"
                className="h-[3.55rem] rounded-lg border-[#11142c1c] pr-11 pl-11 text-[#15172b] shadow-[0_0.65rem_1.6rem_rgba(42,39,84,0.04)] placeholder:font-semibold placeholder:text-[#9296a4] focus-visible:border-[#654cff8c] focus-visible:ring-[#654cff1a]"
                id="signup-password"
                name="password"
                placeholder="Create a password"
                type={isPasswordVisible ? "text" : "password"}
              />
              <button
                aria-label={
                  isPasswordVisible ? "Hide password" : "Show password"
                }
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#8a8e9e]"
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
              className="text-[0.86rem] font-extrabold text-[#15172b]"
              htmlFor="signup-confirm-password"
            >
              Confirm password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-[#8a8e9e]" />
              <Input
                autoComplete="new-password"
                className="h-[3.55rem] rounded-lg border-[#11142c1c] pr-11 pl-11 text-[#15172b] shadow-[0_0.65rem_1.6rem_rgba(42,39,84,0.04)] placeholder:font-semibold placeholder:text-[#9296a4] focus-visible:border-[#654cff8c] focus-visible:ring-[#654cff1a]"
                id="signup-confirm-password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                type={isConfirmPasswordVisible ? "text" : "password"}
              />
              <button
                aria-label={
                  isConfirmPasswordVisible ? "Hide password" : "Show password"
                }
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#8a8e9e]"
                onClick={() => setIsConfirmPasswordVisible((value) => !value)}
                type="button"
              >
                {isConfirmPasswordVisible ? (
                  <EyeOff className="h-[1.1rem] w-[1.1rem]" />
                ) : (
                  <Eye className="h-[1.1rem] w-[1.1rem]" />
                )}
              </button>
            </div>
          </div>

          {notice ? (
            <p className="rounded-lg border border-[#654cff33] bg-[#654cff0d] px-3.5 py-2.5 text-sm font-semibold text-[#4a3bd1]">
              {notice}
            </p>
          ) : null}

          <Button
            className="h-[3.25rem] w-full rounded-lg bg-gradient-to-br from-[#654cff] to-[#5b3ff0] text-base font-bold text-white shadow-[0_1rem_2.1rem_rgba(101,76,255,0.28)] hover:opacity-95"
            data-testid="signup-submit"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <AuthSocialProviders />

        <p className="mt-5 text-center text-[0.9rem] font-semibold text-[#6d7080]">
          Already have an account?{" "}
          <Link className="font-extrabold text-[#654cff]" href="/login">
            Log in
          </Link>
        </p>
      </motion.section>

      <AuthSecurityNote />
    </AuthLayout>
  );
}
