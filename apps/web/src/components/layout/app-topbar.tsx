"use client";

import { Search } from "lucide-react";
import { CreateMenu } from "@/components/layout/create-menu";
import { NotificationBell } from "@/components/layout/notification-bell";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { useWorkspace } from "@/lib/workspace-context";

export function AppTopbar({ compact }: { compact: boolean }) {
  const { workspace } = useWorkspace();

  return (
    <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-black/5 bg-white/60 px-8 backdrop-blur-xl">
      {!compact ? (
        <div className="flex h-11 w-full max-w-md items-center gap-2.5 rounded-xl border border-black/10 bg-white px-3.5">
          <Search className="h-4 w-4 text-[#8a90a3]" />
          <input
            className="h-full flex-1 bg-transparent text-sm text-[#12142b] outline-none placeholder:text-[#9296a4]"
            placeholder="Search projects, tasks, people..."
            type="search"
          />
          <kbd className="rounded-md border border-black/10 bg-[#f8f8ff] px-1.5 py-0.5 text-xs font-medium text-[#6a7086]">
            ⌘K
          </kbd>
        </div>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-3">
        <CreateMenu />
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
