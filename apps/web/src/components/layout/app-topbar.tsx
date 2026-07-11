"use client";

import { CreateMenu } from "@/components/layout/create-menu";
import { GlobalSearch } from "@/components/layout/global-search";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { useWorkspace } from "@/lib/workspace-context";

export function AppTopbar({ compact }: { compact: boolean }) {
  const { workspace } = useWorkspace();

  return (
    <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-black/5 bg-white/60 px-8 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#171a28]/60">
      {!compact ? <GlobalSearch /> : <div />}

      <div className="flex items-center gap-3">
        <CreateMenu />
        <ThemeToggle compact />
        <NotificationBell />
        <AvatarWithStatus
          label={workspace.user.avatarLabel}
          status="online"
          userId={workspace.user.id}
        />
      </div>
    </header>
  );
}
