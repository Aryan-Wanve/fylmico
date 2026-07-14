"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Clapperboard,
  Folder,
  FolderKanban,
  ListChecks,
  MessageSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  Layers,
  CalendarClock,
  Home as HomeIcon
} from "lucide-react";
import { hasSession } from "@/lib/session";

const FEATURES = [
  {
    title: "Project Management",
    description:
      "Plan, organize and track every project from concept to completion.",
    icon: FolderKanban
  },
  {
    title: "Smart Calendar",
    description: "Schedule shoots, meetings and deadlines. Never miss a beat.",
    icon: Calendar
  },
  {
    title: "Task Tracking",
    description: "Break down work, assign to your crew and get things done.",
    icon: ListChecks
  },
  {
    title: "Crew Management",
    description: "Bring your team together and keep everyone in sync.",
    icon: Users
  },
  {
    title: "File Management",
    description: "Store, organize and share files securely in one place.",
    icon: Folder
  },
  {
    title: "Storyboard Studio",
    description: "Visualize ideas with frames, drawings and shot planning.",
    icon: Clapperboard
  },
  {
    title: "Team Communication",
    description: "Chat, share updates and make decisions faster.",
    icon: MessageSquare
  },
  {
    title: "Bookings & Resources",
    description:
      "Manage equipment, locations and resource bookings effortlessly.",
    icon: CalendarClock
  },
  {
    title: "Analytics",
    description:
      "Track progress, performance and project insights in real-time.",
    icon: BarChart3
  },
  {
    title: "House System",
    description:
      "Work in houses (teams) and collaborate across multiple projects.",
    icon: HomeIcon
  },
  {
    title: "Secure & Reliable",
    description: "Your data is safe with enterprise-grade security.",
    icon: ShieldCheck
  },
  {
    title: "And More...",
    description: "We're constantly building new tools to empower creators.",
    icon: Sparkles
  }
];

const STEPS = [
  {
    step: "1",
    title: "Create Your Account",
    description: "Sign up and create your house (team) in just a few clicks.",
    icon: UserPlus
  },
  {
    step: "2",
    title: "Set Up Your Workspace",
    description:
      "Organize projects, invite your crew and set things up your way.",
    icon: Layers
  },
  {
    step: "3",
    title: "Create & Collaborate",
    description: "Plan, create and deliver amazing work - together.",
    icon: Rocket
  }
];

const AUDIENCES = [
  {
    title: "Filmmakers",
    description: "From indie creators to production houses.",
    image: "/images/dashboard/project-echoes.jpg"
  },
  {
    title: "Production Houses",
    description: "Streamline multiple projects and large teams.",
    image: "/images/login-production-set.png"
  },
  {
    title: "Content Creators",
    description: "Manage your creative workflow efficiently.",
    image: "/images/dashboard/project-lumea.jpg"
  },
  {
    title: "Social Media Teams",
    description: "Plan, create and publish content that stands out.",
    image: "/images/dashboard/project-wanderers.jpg"
  }
];

const TESTIMONIALS = [
  {
    quote:
      "Fylmico has completely changed the way our team works. Everything is in one place now, and we actually enjoy the process.",
    name: "Arjun Mehta",
    role: "Director, Frame Foundry",
    avatar: "/images/dashboard/avatar-aryan.jpg"
  },
  {
    quote:
      "Finally, a platform that understands filmmakers. The storyboard tool is insane.",
    name: "Neha Singh",
    role: "Cinematographer",
    avatar: "/images/dashboard/avatar-priya.jpg"
  },
  {
    quote:
      "Managing shoots, files, and people was chaos before. Fylmico made it all so seamless.",
    name: "Kabir Malhotra",
    role: "Producer",
    avatar: "/images/dashboard/avatar-karan.jpg"
  }
];

const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "Features", href: "#features" },
  { label: "For Houses", href: "#how-it-works" },
  { label: "About", href: "#about" }
];

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.5, delay, ease: "easeOut" as const }
  };
}

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a browser-only session flag, not deriving render output
    setIsAuthenticated(hasSession());
  }, []);

  const primaryCtaHref = isAuthenticated ? "/home" : "/signup";
  const primaryCtaLabel = isAuthenticated ? "Open App" : "Get Started";

  return (
    <main id="top" className="min-h-screen bg-[#08080f] text-[#f1f2f8]">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#08080f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
          <Link className="flex items-center gap-2" href="#top">
            <Sparkles className="h-5 w-5 text-[#8b5cf6]" />
            <span className="text-lg font-black">fylmico</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                className="text-sm font-semibold text-[#a8acbf] hover:text-white"
                href={link.href}
                key={link.label}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? null : (
              <Link
                className="hidden h-9 items-center rounded-lg border border-white/10 px-4 text-sm font-bold text-[#f1f2f8] hover:bg-white/5 sm:flex"
                href="/login"
              >
                Log in
              </Link>
            )}
            <Link
              className="flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#654cff] px-4 text-sm font-bold text-white hover:opacity-90"
              href={primaryCtaHref}
            >
              {primaryCtaLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(139,92,246,0.18),transparent)]" />
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:py-24">
          <motion.div {...fadeUp()}>
            <h1 className="max-w-xl text-[2.6rem] leading-[1.08] font-black tracking-tight sm:text-[3.4rem]">
              The Operating System for{" "}
              <span className="bg-gradient-to-r from-[#8b5cf6] to-[#654cff] bg-clip-text text-transparent">
                Creative Production.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-[#a8acbf]">
              Fylmico brings your projects, people and processes together - so
              creative teams can focus on what matters: creating.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                className="flex h-12 items-center gap-2 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#654cff] px-6 text-sm font-bold text-white shadow-[0_1rem_2.5rem_rgba(139,92,246,0.35)] hover:opacity-90"
                href={primaryCtaHref}
              >
                {primaryCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {isAuthenticated ? null : (
                <Link
                  className="flex h-12 items-center rounded-xl border border-white/10 px-6 text-sm font-bold text-[#f1f2f8] hover:bg-white/5"
                  href="/login"
                >
                  Log in
                </Link>
              )}
            </div>
            {isAuthenticated ? null : (
              <p className="mt-3 text-xs font-medium text-[#7d8299]">
                No credit card required
              </p>
            )}
          </motion.div>

          <motion.div
            {...fadeUp(0.15)}
            className="relative rounded-2xl border border-white/10 bg-[#11142c]/60 p-3 shadow-[0_2rem_5rem_rgba(101,76,255,0.2)]"
          >
            <div className="flex items-center gap-1.5 px-2 pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {AUDIENCES.slice(0, 3).map((card, index) => (
                <div
                  className="relative aspect-[4/5] overflow-hidden rounded-xl"
                  key={card.title}
                >
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    priority={index === 0}
                    sizes="16rem"
                    src={card.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-xs font-bold text-white">
                    {card.title}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <motion.div className="text-center" {...fadeUp()}>
          <span className="text-xs font-bold tracking-wide text-[#8b5cf6] uppercase">
            All-in-one platform
          </span>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Everything your team needs,{" "}
            <span className="text-[#8b5cf6]">under one roof.</span>
          </h2>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5"
                key={feature.title}
                {...fadeUp((index % 4) * 0.06)}
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#8b5cf6]/10 text-[#8b5cf6]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-bold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#8a90a3]">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section
        className="border-y border-white/[0.06] bg-white/[0.015]"
        id="how-it-works"
      >
        <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
          <motion.div className="text-center" {...fadeUp()}>
            <span className="text-xs font-bold tracking-wide text-[#8b5cf6] uppercase">
              How it works
            </span>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Get started in{" "}
              <span className="text-[#8b5cf6]">3 simple steps.</span>
            </h2>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
            {STEPS.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  className="flex flex-col items-center text-center"
                  key={item.step}
                  {...fadeUp(index * 0.12)}
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full border border-[#8b5cf6]/40 text-[#8b5cf6]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="mt-3 grid h-6 w-6 place-items-center rounded-full bg-white/10 text-xs font-bold">
                    {item.step}
                  </span>
                  <h3 className="mt-3 text-base font-bold">{item.title}</h3>
                  <p className="mt-1.5 max-w-56 text-sm text-[#8a90a3]">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <motion.div className="text-center" {...fadeUp()}>
          <span className="text-xs font-bold tracking-wide text-[#8b5cf6] uppercase">
            Built for creators
          </span>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Made for every kind of{" "}
            <span className="text-[#8b5cf6]">creative team.</span>
          </h2>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((card, index) => (
            <motion.div
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl"
              key={card.title}
              {...fadeUp(index * 0.08)}
            >
              <Image
                alt=""
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                fill
                sizes="(min-width: 1024px) 16rem, 45vw"
                src={card.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="text-sm font-bold text-white">{card.title}</h3>
                <p className="mt-1 text-xs text-white/70">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section
        className="border-y border-white/[0.06] bg-white/[0.015]"
        id="about"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
          <motion.div className="text-center" {...fadeUp()}>
            <span className="text-xs font-bold tracking-wide text-[#8b5cf6] uppercase">
              Loved by creative teams
            </span>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Here&apos;s what <span className="text-[#8b5cf6]">creators</span>{" "}
              are saying.
            </h2>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map((item, index) => (
              <motion.figure
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5"
                key={item.name}
                {...fadeUp(index * 0.1)}
              >
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Sparkles className="h-3.5 w-3.5 fill-current" key={star} />
                  ))}
                </div>
                <blockquote className="mt-3 text-sm leading-relaxed text-[#c7cad9]">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <Image
                    alt=""
                    className="rounded-full object-cover"
                    height={36}
                    src={item.avatar}
                    width={36}
                  />
                  <div>
                    <p className="text-sm font-bold">{item.name}</p>
                    <p className="text-xs text-[#7d8299]">{item.role}</p>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        <motion.div
          className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-br from-[#8b5cf6] to-[#654cff] px-8 py-10 text-center shadow-[0_2rem_5rem_rgba(139,92,246,0.35)] sm:flex-row sm:text-left"
          {...fadeUp()}
        >
          <div>
            <h2 className="text-xl font-black text-white sm:text-2xl">
              Ready to streamline your creative workflow?
            </h2>
            <p className="mt-1.5 text-sm font-medium text-white/80">
              Join creative teams already building amazing things with Fylmico.
              {isAuthenticated ? "" : " No credit card required."}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              className="flex h-11 items-center gap-1.5 rounded-xl bg-white px-5 text-sm font-bold text-[#654cff] hover:opacity-90"
              href={primaryCtaHref}
            >
              {primaryCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {isAuthenticated ? null : (
              <Link
                className="flex h-11 items-center rounded-xl border border-white/40 px-5 text-sm font-bold text-white hover:bg-white/10"
                href="/login"
              >
                Log in
              </Link>
            )}
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/[0.06] px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#8b5cf6]" />
            <span className="text-lg font-black">fylmico</span>
          </div>
          <p className="mt-2 max-w-xs text-sm text-[#7d8299]">
            The Operating System for Creative Production.
          </p>
          <p className="mt-8 border-t border-white/[0.06] pt-6 text-xs text-[#7d8299]">
            &copy; 2026 Fylmico. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
