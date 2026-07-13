"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Folder,
  ListChecks,
  MessageSquare,
  Users
} from "lucide-react";
import { hasSession } from "@/lib/session";

const FEATURES = [
  {
    title: "Projects",
    description:
      "Track every production from development to delivery, with status, progress, and a due-date view for the whole team.",
    icon: Folder
  },
  {
    title: "Tasks",
    description:
      "Break work down into assignable tasks, group by status or priority, and never lose track of what's due today.",
    icon: ListChecks
  },
  {
    title: "Calendar",
    description:
      "See shoot days, deadlines, and meetings side by side so scheduling conflicts show up before they become problems.",
    icon: Calendar
  },
  {
    title: "Crews",
    description:
      "Keep a roster of everyone who works on your productions - roles, departments, and who's on set today.",
    icon: Users
  },
  {
    title: "Messages",
    description:
      "Coordinate with your whole crew in channels built for production - no more scattered group chats.",
    icon: MessageSquare
  }
];

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a browser-only session flag, not deriving render output
    setIsAuthenticated(hasSession());
  }, []);

  const primaryCtaHref = isAuthenticated ? "/home" : "/signup";
  const primaryCtaLabel = isAuthenticated ? "Open App" : "Get Started for Free";

  return (
    <main className="min-h-screen bg-[#f7f7fb] dark:bg-[#0e0f18]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <Image
            alt=""
            height={30}
            src="/images/login/brand-mark.png"
            width={30}
          />
          <span className="text-xl font-black text-[#12142b] dark:text-[#f1f2f8]">
            fylmico
          </span>
        </div>
        <nav className="flex items-center gap-3">
          {isAuthenticated ? null : (
            <Link
              className="hidden text-sm font-bold text-[#4b5268] hover:text-[#11142c] sm:block dark:text-[#c7cad9] dark:hover:text-[#f1f2f8]"
              href="/login"
            >
              Log in
            </Link>
          )}
          <Link
            className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-br from-[#654cff] to-[#5b3ff0] px-4 text-sm font-bold text-white hover:opacity-95"
            href={primaryCtaHref}
          >
            {primaryCtaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#654cff]/10 px-3 py-1 text-xs font-bold text-[#654cff]">
            The Operating System for Creative Production
          </span>
          <h1 className="mt-5 max-w-lg text-[2.5rem] leading-[1.08] font-black tracking-tight text-[#11142c] sm:text-[3.2rem] dark:text-[#f1f2f8]">
            All your production.{" "}
            <span className="text-[#654cff]">One workspace.</span>
          </h1>
          <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
            Plan shoots, manage teams, track progress, and keep every file,
            script, and storyboard in sync - from pre-production to delivery.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              className="flex h-12 items-center gap-2 rounded-xl bg-gradient-to-br from-[#654cff] to-[#5b3ff0] px-6 text-sm font-bold text-white shadow-[0_1rem_2.1rem_rgba(101,76,255,0.28)] hover:opacity-95"
              href={primaryCtaHref}
            >
              {primaryCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {isAuthenticated ? null : (
              <Link
                className="flex h-12 items-center rounded-xl border border-black/10 px-6 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
                href="/houses/learn"
              >
                See how it works
              </Link>
            )}
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-[0_1.5rem_3.5rem_rgba(53,45,124,0.16)]">
          <Image
            alt=""
            className="object-cover"
            fill
            priority
            sizes="(min-width: 1024px) 40rem, 100vw"
            src="/images/login-hero.png"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
        <div className="text-center">
          <h2 className="text-2xl font-black text-[#11142c] sm:text-3xl dark:text-[#f1f2f8]">
            Everything a production needs, in one place
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-[#5f667d] dark:text-[#a8acbf]">
            No more juggling five different apps to run one shoot.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]"
                key={feature.title}
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#654cff]/10 text-[#654cff]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12 text-center sm:px-10">
        <span className="text-[2.5rem] leading-none font-black text-[#654cff]/40">
          &ldquo;
        </span>
        <p className="mx-auto mt-2 max-w-xl text-lg leading-relaxed font-semibold text-[#11142c] dark:text-[#f1f2f8]">
          Fylmico makes the complex, incredibly simple.
        </p>
        <p className="mt-3 text-sm font-medium text-[#8a90a3] dark:text-[#7d8299]">
          &ndash; Filmmaker, Mumbai
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
        <div className="grid place-items-center gap-4 rounded-3xl bg-gradient-to-br from-[#654cff] to-[#5b3ff0] px-8 py-12 text-center shadow-[0_1.5rem_4rem_rgba(101,76,255,0.35)]">
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            Ready to bring your crew together?
          </h2>
          <p className="max-w-md text-sm font-semibold text-white/80">
            Create your first house in under a minute - no credit card required.
          </p>
          <Link
            className="mt-2 flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-[#654cff] hover:opacity-90"
            href={primaryCtaHref}
          >
            {primaryCtaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/5 px-6 py-8 text-center text-xs text-[#8a90a3] sm:px-10 dark:border-white/[0.06] dark:text-[#7d8299]">
        &copy; 2026 Fylmico. All rights reserved.
      </footer>
    </main>
  );
}
