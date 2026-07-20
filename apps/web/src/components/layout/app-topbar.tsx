"use client";

import { Menu } from "lucide-react";
import { CreateMenu } from "@/components/layout/create-menu";
import { GlobalSearch } from "@/components/layout/global-search";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AccountMenu } from "@/components/layout/account-menu";
import { useWorkspace } from "@/lib/workspace-context";

export function AppTopbar({
  compact,
  onOpenMobileNav
}: {
  compact: boolean;
  onOpenMobileNav?: () => void;
}) {
  const { workspace } = useWorkspace();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-black/5 bg-white/60 px-4 backdrop-blur-xl sm:h-20 sm:gap-4 sm:px-8 dark:border-white/[0.06] dark:bg-[#171a28]/60">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        {!compact ? (
          <button
            aria-label="Open menu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#4b5268] hover:bg-black/[0.04] lg:hidden dark:text-[#c7cad9] dark:hover:bg-white/[0.06]"
            onClick={onOpenMobileNav}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : null}
        {!compact ? (
          <div className="hidden min-w-0 flex-1 sm:block">
            <GlobalSearch />
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <CreateMenu />
        <ThemeToggle compact />
        <NotificationBell />
        <AccountMenu user={workspace.user} />
      </div>
    </header>
  );
}
