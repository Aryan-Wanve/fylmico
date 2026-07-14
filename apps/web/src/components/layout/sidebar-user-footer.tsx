"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, Home, LogOut, Settings } from "lucide-react";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { logout } from "@/services/base-workspace.service";
import type { UserProfile } from "@/types/base";

export function SidebarUserFooter({ user }: { user: UserProfile }) {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className="flex w-full items-center gap-2.5 rounded-xl px-1.5 py-2 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
            type="button"
          >
            <AvatarWithStatus
              imageUrl={user.avatarUrl}
              label={user.avatarLabel}
              status="online"
              userId={user.id}
            />
            <span className="grid min-w-0 flex-1">
              <strong className="truncate text-sm font-bold text-[#12142b] dark:text-[#f1f2f8]">
                {user.name}
              </strong>
              <span className="truncate text-xs text-[#5f667d] dark:text-[#a8acbf]">
                {user.email}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[#8a90a3] dark:text-[#7d8299]" />
          </button>
        }
      />
      <DropdownMenuContent align="start" className="w-48" side="top">
        <DropdownMenuItem render={<a href="/dashboard" />}>
          <Home className="h-4 w-4" />
          Switch house
        </DropdownMenuItem>
        <DropdownMenuItem render={<a href="/settings" />}>
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} variant="destructive">
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
