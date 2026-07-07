"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/layout/nav-items";
import { UpgradeCard } from "@/components/layout/upgrade-card";
import { SidebarUserFooter } from "@/components/layout/sidebar-user-footer";
import type { UserProfile } from "@/types/base";

export function AppSidebar({
  compact,
  user
}: {
  compact: boolean;
  user: UserProfile;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={
        compact
          ? "flex h-full w-20 shrink-0 flex-col items-center gap-6 overflow-hidden border-r border-black/5 bg-white/70 py-6 backdrop-blur-xl"
          : "flex h-full w-[17rem] shrink-0 flex-col gap-6 overflow-hidden border-r border-black/5 bg-white/70 px-5 py-6 backdrop-blur-xl"
      }
    >
      <Link
        className={
          compact
            ? "grid shrink-0 place-items-center"
            : "flex shrink-0 items-center gap-2.5 px-1.5"
        }
        href="/"
      >
        <Image
          alt=""
          height={28}
          src="/images/login/brand-mark.png"
          width={28}
        />
        {!compact ? (
          <span className="text-lg font-black text-[#12142b]">fylmico</span>
        ) : null}
      </Link>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
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
              : "text-[#4b5268] hover:bg-black/[0.03] hover:text-[#12142b]",
            item.href === null
              ? "cursor-default opacity-60 hover:bg-transparent hover:text-[#4b5268]"
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

      {!compact ? (
        <div className="grid shrink-0 gap-6">
          <UpgradeCard />
          <SidebarUserFooter user={user} />
        </div>
      ) : null}
    </aside>
  );
}
