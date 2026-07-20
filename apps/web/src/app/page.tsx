"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Aperture,
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  Clapperboard,
  Folder,
  FolderKanban,
  Grid2x2,
  ListChecks,
  MessageSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  UserPlus,
  Users,
  Layers,
  CalendarClock,
  Home as HomeIcon
} from "lucide-react";
import { hasSession } from "@/lib/session";
import { navItems } from "@/components/layout/nav-items";

const MOCK_PROJECTS = [
  {
    title: "The Horizon",
    category: "Short Film",
    status: "In Progress",
    statusClass: "bg-[var(--fylmico-accent)]/20 text-[#b0a1ff]",
    barClass: "from-[#38bdf8] to-[var(--fylmico-accent)]",
    percent: 72,
    extra: 8,
    avatars: [
      "/images/dashboard/avatar-ananya.jpg",
      "/images/dashboard/avatar-rahul.jpg",
      "/images/dashboard/avatar-priya.jpg"
    ]
  },
  {
    title: "Urban Echoes",
    category: "Music Video",
    status: "Pre-Production",
    statusClass: "bg-fuchsia-500/20 text-fuchsia-300",
    barClass: "from-fuchsia-400 to-[#8b5cf6]",
    percent: 48,
    extra: 5,
    avatars: [
      "/images/dashboard/avatar-karan.jpg",
      "/images/dashboard/avatar-priya.jpg",
      "/images/dashboard/avatar-aryan.jpg"
    ]
  },
  {
    title: "Echo Chamber",
    category: "Documentary",
    status: "In Post-Production",
    statusClass: "bg-teal-500/20 text-teal-300",
    barClass: "from-teal-400 to-cyan-500",
    percent: 63,
    extra: 6,
    avatars: [
      "/images/dashboard/avatar-rahul.jpg",
      "/images/dashboard/avatar-ananya.jpg",
      "/images/dashboard/avatar-karan.jpg"
    ]
  }
];

const TRUSTED_BY = [
  { name: "REELIFY", icon: null },
  { name: "Frame Foundry", icon: Aperture },
  { name: "motion collective", icon: Sparkles },
  { name: "FOCUS STUDIOS", icon: Grid2x2 },
  { name: "SHOTMAKERS", icon: null }
];

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#" },
    { label: "Changelog", href: "#" }
  ],
  "For Houses": [
    { label: "Why Houses?", href: "#how-it-works" },
    { label: "House Directory", href: "#" },
    { label: "Resources", href: "#" }
  ],
  Company: [
    { label: "About Us", href: "#about" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" }
  ]
};

function XIcon(props: { className?: string }) {
  return (
    <svg className={props.className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7l-5.5-7.2L4.5 22H1.4l8.1-9.3L1 2h7.2l5 6.6L18.9 2Zm-1.2 18h1.7L6.4 3.9H4.6L17.7 20Z" />
    </svg>
  );
}

function InstagramIcon(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <rect height="18" rx="5" width="18" x="3" y="3" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" fill="currentColor" r="1" stroke="none" />
    </svg>
  );
}

function YoutubeIcon(props: { className?: string }) {
  return (
    <svg className={props.className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.5 6.4a2.8 2.8 0 0 0-2-2C18.7 4 12 4 12 4s-6.7 0-8.5.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 5.6 2.8 2.8 0 0 0 2 2C5.3 20 12 20 12 20s6.7 0 8.5-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-5.6ZM10 15.5v-7l6 3.5Z" />
    </svg>
  );
}

function DiscordIcon(props: { className?: string }) {
  return (
    <svg className={props.className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 5.4A17.5 17.5 0 0 0 15.6 4l-.3.6a13 13 0 0 1 3.8 1.5 15.6 15.6 0 0 0-14.2 0A13 13 0 0 1 8.7 4.6L8.4 4A17.5 17.5 0 0 0 4 5.4C1.6 9 1 12.4 1.2 15.8a17.6 17.6 0 0 0 5.4 2.7l.7-1.1a11 11 0 0 1-1.7-.8l.4-.3a12.6 12.6 0 0 0 10 0l.4.3a11 11 0 0 1-1.7.8l.7 1.1a17.6 17.6 0 0 0 5.4-2.7c.3-4-.7-7.4-2.8-10.4ZM8.8 13.9c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.7.8 1.6 1.8c0 1-.7 1.8-1.6 1.8Zm6.4 0c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.7.8 1.6 1.8c0 1-.7 1.8-1.6 1.8Z" />
    </svg>
  );
}

const SOCIAL_ICONS = [XIcon, InstagramIcon, YoutubeIcon, DiscordIcon];

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
              className="flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[var(--fylmico-accent)] px-4 text-sm font-bold text-white hover:opacity-90"
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
              <span className="bg-gradient-to-r from-[#8b5cf6] to-[var(--fylmico-accent)] bg-clip-text text-transparent">
                Creative Production.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-[#a8acbf]">
              Fylmico brings your projects, people and processes together - so
              creative teams can focus on what matters: creating.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                className="flex h-12 items-center gap-2 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[var(--fylmico-accent)] px-6 text-sm font-bold text-white shadow-[0_1rem_2.5rem_rgba(139,92,246,0.35)] hover:opacity-90"
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
              <p className="mt-3 text-xs font-medium text-[#878ca0]">
                No credit card required
              </p>
            )}
          </motion.div>

          <motion.div
            {...fadeUp(0.15)}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e1a] p-2 shadow-[0_2rem_5rem_rgba(101,76,255,0.25)]"
          >
            <div className="flex overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a0b14]">
              <div className="hidden w-36 shrink-0 flex-col gap-0.5 border-r border-white/[0.06] bg-white/[0.02] p-2.5 md:flex">
                <div className="mb-2 flex items-center gap-1.5 px-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#8b5cf6]" />
                  <span className="text-xs font-black">fylmico</span>
                </div>
                {navItems.slice(0, 10).map((item) => (
                  <span
                    className={`truncate rounded-lg px-2 py-1.5 text-[0.65rem] font-semibold ${
                      item.id === "projects"
                        ? "bg-[#8b5cf6]/15 text-[#a996ff]"
                        : "text-[#878ca0]"
                    }`}
                    key={item.id}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
              <div className="flex-1 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black">Projects</span>
                  <div className="flex items-center gap-2">
                    <Bell className="h-3.5 w-3.5 text-[#878ca0]" />
                    <Image
                      alt=""
                      className="rounded-full object-cover"
                      height={18}
                      src="/images/dashboard/avatar-aryan.jpg"
                      width={18}
                    />
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[0.65rem] text-[#878ca0]">
                  Search projects...
                </div>
                <div className="mt-2 flex gap-1.5">
                  {["All", "Active", "Completed", "Archived"].map(
                    (tab, index) => (
                      <span
                        className={`rounded-md px-2 py-1 text-[0.6rem] font-bold ${
                          index === 0
                            ? "bg-[#8b5cf6] text-white"
                            : "bg-white/[0.04] text-[#878ca0]"
                        }`}
                        key={tab}
                      >
                        {tab}
                      </span>
                    )
                  )}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {MOCK_PROJECTS.map((project) => (
                    <div
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2"
                      key={project.title}
                    >
                      <div className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-[#8b5cf6]/30 to-[var(--fylmico-accent)]/30">
                        <Clapperboard className="h-3 w-3 text-[#c7bbff]" />
                      </div>
                      <p className="mt-1.5 truncate text-[0.62rem] font-bold">
                        {project.title}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded px-1 py-0.5 text-[0.52rem] font-bold ${project.statusClass}`}
                      >
                        {project.status}
                      </span>
                      <p className="mt-1 truncate text-[0.55rem] text-[#878ca0]">
                        {project.category}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <div className="flex -space-x-1.5">
                          {project.avatars.map((avatar) => (
                            <Image
                              alt=""
                              className="rounded-full border border-[#0a0b14] object-cover"
                              height={12}
                              key={avatar}
                              src={avatar}
                              width={12}
                            />
                          ))}
                          <span className="grid h-3 w-3 place-items-center rounded-full border border-[#0a0b14] bg-white/10 text-[0.42rem] font-bold">
                            +{project.extra}
                          </span>
                        </div>
                        <span className="text-[0.55rem] font-bold">
                          {project.percent}%
                        </span>
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${project.barClass}`}
                          style={{ width: `${project.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          {...fadeUp(0.1)}
          className="mx-auto max-w-6xl px-6 pb-16 sm:px-10"
        >
          <p className="text-center text-xs font-bold tracking-widest text-[#878ca0] uppercase">
            Trusted by creative teams at
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70 grayscale">
            {TRUSTED_BY.map((brand) => {
              const Icon = brand.icon;
              return (
                <span
                  className="flex items-center gap-1.5 text-lg font-black text-[#c7cad9]"
                  key={brand.name}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {brand.name}
                </span>
              );
            })}
            <span className="text-sm font-semibold text-[#878ca0]">
              &amp; more
            </span>
          </div>
        </motion.div>
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
                <p className="mt-1.5 text-sm leading-relaxed text-[#667085]">
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
                  <p className="mt-1.5 max-w-56 text-sm text-[#667085]">
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
                    <Star className="h-3.5 w-3.5 fill-current" key={star} />
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
                    <p className="text-xs text-[#878ca0]">{item.role}</p>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            {TESTIMONIALS.map((item, index) => (
              <span
                className={`h-1.5 rounded-full transition-all ${
                  index === 0 ? "w-5 bg-[#8b5cf6]" : "w-1.5 bg-white/15"
                }`}
                key={item.name}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        <motion.div
          className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#8b5cf6] to-[var(--fylmico-accent)] px-8 py-10 text-center shadow-[0_2rem_5rem_rgba(139,92,246,0.35)] sm:flex-row sm:text-left"
          {...fadeUp()}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -bottom-24 h-64 w-64 rounded-full border border-white/20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -bottom-40 h-80 w-80 rounded-full border border-white/10"
          />
          <div className="relative">
            <h2 className="text-xl font-black text-white sm:text-2xl">
              Ready to streamline your creative workflow?
            </h2>
            <p className="mt-1.5 text-sm font-medium text-white/80">
              Join creative teams already building amazing things with Fylmico.
              {isAuthenticated ? "" : " No credit card required."}
            </p>
          </div>
          <div className="relative flex shrink-0 items-center gap-3">
            <Link
              className="flex h-11 items-center gap-1.5 rounded-xl bg-white px-5 text-sm font-bold text-[var(--fylmico-accent)] hover:opacity-90"
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

      <footer className="border-t border-white/[0.06] px-6 py-12 sm:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 sm:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#8b5cf6]" />
              <span className="text-lg font-black">fylmico</span>
            </div>
            <p className="mt-2 max-w-xs text-sm text-[#878ca0]">
              The Operating System for Creative Production.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {SOCIAL_ICONS.map((Icon, index) => (
                <span
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-[#a8acbf] hover:bg-white/5 hover:text-white"
                  key={index}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-bold text-white">{heading}</h3>
              <ul className="mt-4 grid gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      className="text-sm text-[#878ca0] hover:text-white"
                      href={link.href}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 sm:flex-row">
          <p className="text-xs text-[#878ca0]">
            &copy; 2026 Fylmico. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a className="text-xs text-[#878ca0] hover:text-white" href="#">
              Privacy Policy
            </a>
            <a className="text-xs text-[#878ca0] hover:text-white" href="#">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
