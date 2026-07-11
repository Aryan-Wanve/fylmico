"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/login/auth-layout";
import { AuthSocialProviders } from "@/components/login/auth-social-providers";
import { AuthSecurityNote } from "@/components/login/auth-security-note";

export type LoginAsyncState = "idle" | "loading" | "success" | "error";

type LoginPageProps = {
  authState: LoginAsyncState;
  error: string;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
};

export function LoginPage({ authState, error, onLogin }: LoginPageProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
            Welcome back {"\u{1F44B}"}
          </h2>
          <p className="mt-2 font-semibold text-[#75798a] dark:text-[#8b8fa3]">
            Log in to continue to Fylmico
          </p>
        </header>

        <form className="mt-7 grid gap-5" onSubmit={onLogin}>
          <div className="grid gap-2">
            <Label
              className="text-[0.86rem] font-extrabold text-[#15172b] dark:text-[#f1f2f8]"
              htmlFor="login-email"
            >
              Email address
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-[#8a8e9e] dark:text-[#7d8299]" />
              <Input
                autoComplete="email"
                className="h-[3.55rem] rounded-lg border-[#11142c1c] pl-11 text-[#15172b] shadow-[0_0.65rem_1.6rem_rgba(42,39,84,0.04)] placeholder:font-semibold placeholder:text-[#9296a4] focus-visible:border-[#654cff8c] focus-visible:ring-[#654cff1a] dark:text-[#f1f2f8] dark:placeholder:text-[#7d8299]"
                id="login-email"
                name="email"
                placeholder="Enter your email"
                type="email"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label
              className="text-[0.86rem] font-extrabold text-[#15172b] dark:text-[#f1f2f8]"
              htmlFor="login-password"
            >
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-[#8a8e9e] dark:text-[#7d8299]" />
              <Input
                autoComplete="current-password"
                className="h-[3.55rem] rounded-lg border-[#11142c1c] pr-11 pl-11 text-[#15172b] shadow-[0_0.65rem_1.6rem_rgba(42,39,84,0.04)] placeholder:font-semibold placeholder:text-[#9296a4] focus-visible:border-[#654cff8c] focus-visible:ring-[#654cff1a] dark:text-[#f1f2f8] dark:placeholder:text-[#7d8299]"
                id="login-password"
                name="password"
                placeholder="Enter your password"
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

          <Link
            className="-mt-1 justify-self-end text-[0.86rem] font-extrabold text-[#654cff] no-underline"
            href="/forgot-password"
          >
            Forgot password?
          </Link>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-600">
              {error}
            </p>
          ) : null}

          <Button
            className="h-[3.25rem] w-full rounded-lg bg-gradient-to-br from-[#654cff] to-[#5b3ff0] text-base font-bold text-white shadow-[0_1rem_2.1rem_rgba(101,76,255,0.28)] hover:opacity-95"
            data-testid="login-submit"
            disabled={authState === "loading"}
            type="submit"
          >
            {authState === "loading" ? "Logging in..." : "Log In"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <AuthSocialProviders />

        <p className="mt-5 text-center text-[0.9rem] font-semibold text-[#6d7080] dark:text-[#8b8fa3]">
          Not a member yet?{" "}
          <Link className="font-extrabold text-[#654cff]" href="/signup">
            Sign up now
          </Link>
        </p>
      </motion.section>

      <AuthSecurityNote />
    </AuthLayout>
  );
}
