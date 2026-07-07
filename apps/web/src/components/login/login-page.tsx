"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LoginAsyncState = "idle" | "loading" | "success" | "error";

type AuthMode = "login" | "signup";

const authModeCopy: Record<AuthMode, { heading: string; subtitle: string }> = {
  login: {
    heading: "Welcome back \u{1F44B}",
    subtitle: "Log in to continue to Fylmico"
  },
  signup: {
    heading: "Create your account",
    subtitle: "Start planning your next production with Fylmico"
  }
};

type LoginPageProps = {
  authState: LoginAsyncState;
  error: string;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
};

const features: Array<{
  icon: string;
  title: string;
  body: string;
}> = [
  {
    icon: "/images/login/calendar.png",
    title: "Plan & Schedule",
    body: "Organize shoots and deadlines"
  },
  {
    icon: "/images/login/team.png",
    title: "Manage Teams",
    body: "Assign roles and collaborate"
  },
  {
    icon: "/images/login/folder.png",
    title: "Store & Share",
    body: "Keep files, notes and assets safe"
  },
  {
    icon: "/images/login/progress.png",
    title: "Track Progress",
    body: "Stay updated and deliver on time"
  }
];

const socialProviders: Array<{ id: string; label: string; icon: string }> = [
  { id: "google", label: "Google", icon: "/images/login/google.png" },
  { id: "apple", label: "Apple", icon: "/images/login/apple.png" },
  { id: "microsoft", label: "Microsoft", icon: "/images/login/microsoft.png" }
];

const authTabs: Array<{ id: AuthMode; label: string }> = [
  { id: "login", label: "Log In" },
  { id: "signup", label: "Sign Up" }
];

export function LoginPage({ authState, error, onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);
  const [signupNotice, setSignupNotice] = useState("");

  function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSignupSubmitting(true);
    setSignupNotice("");

    window.setTimeout(() => {
      setIsSignupSubmitting(false);
      setSignupNotice(
        "Sign up isn't open yet in this preview. Ask your house owner for an invite instead."
      );
    }, 500);
  }

  return (
    <main className="relative grid min-h-screen grid-cols-1 overflow-hidden md:grid-cols-2">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover"
        style={{
          backgroundImage: "url(/images/login-hero.png)",
          backgroundPosition: "50% 100%"
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #f6f5ff 0rem, #f6f5ff 30rem, rgba(246,245,255,0.85) 33rem, rgba(246,245,255,0.35) 36rem, rgba(246,245,255,0) 40rem)"
        }}
      />

      <section className="relative hidden min-h-screen flex-col px-12 pt-11 md:flex xl:px-16">
        <div
          aria-hidden="true"
          className="absolute top-[5.8rem] left-[62%] z-[1] h-16 w-[5.4rem] opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(#8d91a9 1.35px, transparent 1.35px)",
            backgroundSize: "0.75rem 0.75rem"
          }}
        />

        <header
          aria-label="Fylmico"
          className="relative z-10 flex items-center gap-3"
        >
          <Image
            alt=""
            height={38}
            src="/images/login/brand-mark.png"
            width={38}
          />
          <span className="text-2xl font-black text-[#12142b]">fylmico</span>
        </header>

        <section
          aria-labelledby="login-heading"
          className="relative z-10 mt-11 max-w-[34rem]"
        >
          <h1
            className="max-w-[27rem] text-[3.1rem] leading-[1.05] font-black tracking-tight text-[#11142c] xl:text-[3.6rem]"
            id="login-heading"
          >
            All your production.
            <span className="block text-[#654cff]">One workspace.</span>
          </h1>
          <p className="mt-7 max-w-[23rem] border-l-2 border-[#6b55ff] pl-5 text-[1.05rem] leading-relaxed font-semibold text-[#4f5265]">
            Plan shoots. Manage teams. Track progress. Create stories. Fylmico
            keeps your production in sync, from pre to post.
          </p>
        </section>

        <section
          aria-label="Fylmico tools"
          className="relative z-10 mt-7 grid max-w-[42rem] grid-cols-4 gap-8"
        >
          {features.map((feature) => (
            <article className="min-w-0" key={feature.title}>
              <div className="grid h-[3.2rem] w-[3.2rem] place-items-center rounded-[0.78rem] border border-[#6d52ff14] bg-white/75 shadow-[0_1.1rem_2.5rem_rgba(87,70,180,0.12)] backdrop-blur-md">
                <Image alt="" height={26} src={feature.icon} width={26} />
              </div>
              <h2 className="mt-3 text-sm font-extrabold text-[#15172b]">
                {feature.title}
              </h2>
              <p className="mt-1 text-[0.79rem] leading-snug font-semibold text-[#4d5060]">
                {feature.body}
              </p>
            </article>
          ))}
        </section>

        <aside
          aria-label="Customer quote"
          className="absolute bottom-8 left-12 z-10 w-[min(17.7rem,42vw)] rounded-xl border border-white/25 bg-gradient-to-br from-white/15 via-white/5 to-black/25 p-5 text-white shadow-[0_1.2rem_3rem_rgba(10,8,35,0.45)] backdrop-blur-xl backdrop-saturate-150 xl:left-16"
        >
          <span className="text-[2.15rem] leading-[0.7] font-black text-white/90">
            &ldquo;
          </span>
          <p className="mt-1 mb-2 text-[0.88rem] leading-relaxed font-semibold text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]">
            Fylmico makes the complex, incredibly simple.
          </p>
          <strong className="text-[0.82rem] font-medium text-white/80">
            &ndash; Filmmaker, Mumbai
          </strong>
        </aside>
      </section>

      <section
        aria-label="Authentication"
        className="relative flex flex-col items-center justify-center px-6 py-16 sm:px-10"
      >
        <section className="w-full max-w-[27rem] rounded-2xl border border-black/[0.06] bg-white p-8 shadow-[0_1.8rem_5rem_rgba(55,48,120,0.12)] sm:p-11">
          <AnimatePresence initial={false} mode="wait">
            <motion.header
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              initial={{ opacity: 0, y: -6 }}
              key={mode}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <h2 className="text-[1.85rem] font-black text-[#11142c]">
                {authModeCopy[mode].heading}
              </h2>
              <p className="mt-2 font-semibold text-[#75798a]">
                {authModeCopy[mode].subtitle}
              </p>
            </motion.header>
          </AnimatePresence>

          <div className="mt-7 grid grid-cols-2 border-b border-[#11142c1a]">
            {authTabs.map((tab) => (
              <button
                className={`relative h-11 text-[0.95rem] font-extrabold transition-colors ${
                  mode === tab.id ? "text-[#654cff]" : "text-[#6d7080]"
                }`}
                key={tab.id}
                onClick={() => setMode(tab.id)}
                type="button"
              >
                {tab.label}
                {mode === tab.id ? (
                  <motion.span
                    className="absolute inset-x-0 -bottom-px h-[2px] bg-[#654cff]"
                    layoutId="auth-tab-indicator"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                ) : null}
              </button>
            ))}
          </div>

          <AnimatePresence initial={false} mode="wait">
            {mode === "login" ? (
              <motion.form
                animate={{ opacity: 1, x: 0 }}
                className="mt-7 grid gap-5"
                exit={{ opacity: 0, x: -12 }}
                initial={{ opacity: 0, x: -12 }}
                key="login-form"
                onSubmit={onLogin}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="grid gap-2">
                  <Label
                    className="text-[0.86rem] font-extrabold text-[#15172b]"
                    htmlFor="login-email"
                  >
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-[#8a8e9e]" />
                    <Input
                      autoComplete="email"
                      className="h-[3.55rem] rounded-lg border-[#11142c1c] pl-11 text-[#15172b] shadow-[0_0.65rem_1.6rem_rgba(42,39,84,0.04)] placeholder:font-semibold placeholder:text-[#9296a4] focus-visible:border-[#654cff8c] focus-visible:ring-[#654cff1a]"
                      id="login-email"
                      name="email"
                      placeholder="Enter your email"
                      type="email"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label
                    className="text-[0.86rem] font-extrabold text-[#15172b]"
                    htmlFor="login-password"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-[#8a8e9e]" />
                    <Input
                      autoComplete="current-password"
                      className="h-[3.55rem] rounded-lg border-[#11142c1c] pr-11 pl-11 text-[#15172b] shadow-[0_0.65rem_1.6rem_rgba(42,39,84,0.04)] placeholder:font-semibold placeholder:text-[#9296a4] focus-visible:border-[#654cff8c] focus-visible:ring-[#654cff1a]"
                      id="login-password"
                      name="password"
                      placeholder="Enter your password"
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

                <a
                  className="-mt-1 justify-self-end text-[0.86rem] font-extrabold text-[#654cff] no-underline"
                  href="#forgot-password"
                >
                  Forgot password?
                </a>

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
              </motion.form>
            ) : (
              <motion.form
                animate={{ opacity: 1, x: 0 }}
                className="mt-7 grid gap-5"
                exit={{ opacity: 0, x: 12 }}
                initial={{ opacity: 0, x: 12 }}
                key="signup-form"
                onSubmit={handleSignupSubmit}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
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
                        isConfirmPasswordVisible
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#8a8e9e]"
                      onClick={() =>
                        setIsConfirmPasswordVisible((value) => !value)
                      }
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

                {signupNotice ? (
                  <p className="rounded-lg border border-[#654cff33] bg-[#654cff0d] px-3.5 py-2.5 text-sm font-semibold text-[#4a3bd1]">
                    {signupNotice}
                  </p>
                ) : null}

                <Button
                  className="h-[3.25rem] w-full rounded-lg bg-gradient-to-br from-[#654cff] to-[#5b3ff0] text-base font-bold text-white shadow-[0_1rem_2.1rem_rgba(101,76,255,0.28)] hover:opacity-95"
                  data-testid="signup-submit"
                  disabled={isSignupSubmitting}
                  type="submit"
                >
                  {isSignupSubmitting
                    ? "Creating account..."
                    : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="my-6 flex items-center gap-4 text-[0.86rem] font-semibold text-[#838797]">
            <span className="h-px flex-1 bg-[#11142c1a]" />
            <span>or continue with</span>
            <span className="h-px flex-1 bg-[#11142c1a]" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {socialProviders.map((provider) => (
              <button
                className="flex h-[3.45rem] items-center justify-center gap-2.5 rounded-lg border border-[#11142c1a] bg-white font-extrabold text-[#15172b] shadow-[0_0.7rem_1.6rem_rgba(42,39,84,0.035)] transition hover:-translate-y-px"
                key={provider.id}
                type="button"
              >
                <Image alt="" height={22} src={provider.icon} width={22} />
                {provider.label}
              </button>
            ))}
          </div>
        </section>

        <aside className="mt-8 flex w-full max-w-[27rem] items-center gap-4 rounded-xl bg-white/70 p-3 text-[#515568] shadow-[0_0.8rem_2rem_rgba(53,45,124,0.06)] backdrop-blur-xl">
          <Image
            alt=""
            height={44}
            src="/images/login/security.png"
            width={44}
          />
          <p className="grid gap-1 text-[0.82rem] leading-snug">
            <strong className="text-[0.88rem] text-[#202437]">
              Your data is safe with us.
            </strong>
            <span>
              We use enterprise-grade security to keep your projects protected.
            </span>
          </p>
        </aside>
      </section>
    </main>
  );
}
