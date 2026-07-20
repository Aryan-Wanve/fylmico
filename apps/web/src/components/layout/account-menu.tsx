"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, LogOut, Settings, UserCog } from "lucide-react";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { AccountDialog } from "@/components/layout/account-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { logout } from "@/services/base-workspace.service";
import type { UserProfile } from "@/types/base";

export function AccountMenu({ user }: { user: UserProfile }) {
  const router = useRouter();
  const [accountOpen, setAccountOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              aria-label="Account menu"
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#654cff]/50"
              type="button"
            >
              <AvatarWithStatus
                imageUrl={user.avatarUrl}
                label={user.avatarLabel}
                status="online"
                userId={user.id}
              />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-60">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <AvatarWithStatus
              imageUrl={user.avatarUrl}
              label={user.avatarLabel}
              size="sm"
              userId={user.id}
            />
            <span className="grid min-w-0">
              <strong className="truncate text-sm font-bold text-[#12142b] dark:text-[#f1f2f8]">
                {user.name}
              </strong>
              <span className="truncate text-xs text-[#5f667d] dark:text-[#a8acbf]">
                {user.email}
              </span>
            </span>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setAccountOpen(true)}>
            <UserCog className="h-4 w-4" />
            Profile &amp; Account
          </DropdownMenuItem>
          <DropdownMenuItem render={<a href="/dashboard" />}>
            <Home className="h-4 w-4" />
            Switch house
          </DropdownMenuItem>
          <DropdownMenuItem render={<a href="/settings" />}>
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} variant="destructive">
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AccountDialog onOpenChange={setAccountOpen} open={accountOpen} />
    </>
  );
}
