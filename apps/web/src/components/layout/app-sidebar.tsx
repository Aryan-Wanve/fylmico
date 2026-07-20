"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, X } from "lucide-react";
import { navItems } from "@/components/layout/nav-items";
import { ALWAYS_ENABLED_MODULES } from "@/lib/house-types";

export function AppSidebar({
  compact,
  enabledModules,
  mobileOpen = false,
  onCloseMobile
}: {
  compact: boolean;
  enabledModules: string[] | null;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();
  const visibleNavItems = navItems.filter(
    (item) =>
      !enabledModules ||
      ALWAYS_ENABLED_MODULES.includes(item.id) ||
      enabledModules.includes(item.id)
  );

  return (
    <>
      {!compact && mobileOpen ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        className={
          compact
            ? "flex h-full w-20 shrink-0 flex-col items-center gap-6 overflow-hidden border-r border-black/5 bg-white/70 py-6 backdrop-blur-xl dark:border-white/[0.06]"
            : `fixed inset-y-0 left-0 z-50 flex h-full w-[17rem] shrink-0 flex-col gap-6 overflow-hidden border-r border-black/5 bg-white px-5 py-6 backdrop-blur-xl transition-transform duration-200 lg:relative lg:translate-x-0 lg:bg-white/70 dark:border-white/[0.06] dark:bg-[#0e0f18] ${
                mobileOpen ? "translate-x-0" : "-translate-x-full"
              }`
        }
      >
        <div
          className={
            compact
              ? "grid shrink-0 place-items-center"
              : "flex shrink-0 items-center justify-between gap-2.5 px-1.5"
          }
        >
          <Link
            className={
              compact ? "grid place-items-center" : "flex items-center gap-2.5"
            }
            href="/dashboard"
          >
            <Image
              alt=""
              height={28}
              src="/images/login/brand-mark.png"
              width={28}
            />
            {!compact ? (
              <span className="text-lg font-black text-[#12142b] dark:text-[#f1f2f8]">
                fylmico
              </span>
            ) : null}
          </Link>
          {!compact ? (
            <button
              aria-label="Close menu"
              className="grid h-8 w-8 place-items-center rounded-lg text-[#8a90a3] hover:bg-black/[0.04] lg:hidden dark:text-[#7d8299] dark:hover:bg-white/[0.06]"
              onClick={onCloseMobile}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href !== null && pathname === item.href;
            const content = (
              <>
                <Icon className="h-[1.15rem] w-[1.15rem] shrink-0" />
                {!compact ? (
                  <span className="flex-1 text-left">{item.label}</span>
                ) : null}
                {item.badge && !compact ? (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#654cff] px-1 text-[0.68rem] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </>
            );

            const className = [
              "flex items-center gap-3 rounded-xl text-sm font-semibold transition-colors",
              compact ? "h-11 w-11 justify-center" : "h-11 px-3",
              isActive
                ? "bg-[#654cff]/10 text-[#654cff]"
                : "text-[#4b5268] dark:text-[#c7cad9] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] hover:text-[#12142b] dark:hover:text-[#f1f2f8]",
              item.href === null
                ? "cursor-default opacity-60 hover:bg-transparent hover:text-[#4b5268] dark:hover:text-[#c7cad9]"
                : ""
            ].join(" ");

            if (item.href === null) {
              return (
                <button
                  aria-disabled="true"
                  className={className}
                  key={item.id}
                  title={compact ? item.label : undefined}
                  type="button"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={className}
                href={item.href}
                key={item.id}
                title={compact ? item.label : undefined}
              >
                {content}
              </Link>
            );
          })}
        </nav>

        <Link
          aria-current={pathname === "/settings" ? "page" : undefined}
          className={[
            "flex shrink-0 items-center gap-3 rounded-xl text-sm font-semibold transition-colors",
            compact ? "h-11 w-11 justify-center" : "h-11 px-3",
            pathname === "/settings"
              ? "bg-[#654cff]/10 text-[#654cff]"
              : "text-[#4b5268] hover:bg-black/[0.03] hover:text-[#12142b] dark:text-[#c7cad9] dark:hover:bg-white/[0.05] dark:hover:text-[#f1f2f8]"
          ].join(" ")}
          href="/settings"
          title={compact ? "Settings" : undefined}
        >
          <Settings className="h-[1.15rem] w-[1.15rem] shrink-0" />
          {!compact ? <span className="flex-1 text-left">Settings</span> : null}
        </Link>
      </aside>
    </>
  );
}
