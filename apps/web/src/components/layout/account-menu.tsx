"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserCog } from "lucide-react";
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
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--fylmico-accent)]/50"
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
        <DropdownMenuContent align="end" className="w-72 p-0 pt-1">
          <div className="grid justify-items-center gap-2 px-4 pt-3 pb-4 text-center">
            <AvatarWithStatus
              imageUrl={user.avatarUrl}
              label={user.avatarLabel}
              size="lg"
              status="online"
              userId={user.id}
            />
            <div className="grid justify-items-center gap-0.5">
              <strong className="truncate text-sm font-bold text-[#12142b] dark:text-[#f1f2f8]">
                {user.name}
              </strong>
              <span className="truncate text-xs text-[#667085] dark:text-[#878ca0]">
                {user.email}
              </span>
            </div>
            <button
              className="mt-1 rounded-full border border-black/10 px-4 py-1.5 text-xs font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.06]"
              onClick={() => setAccountOpen(true)}
              type="button"
            >
              Manage your profile
            </button>
          </div>
          <DropdownMenuSeparator className="mx-0" />
          <div className="p-1.5">
            <DropdownMenuItem onClick={() => setAccountOpen(true)}>
              <UserCog className="h-4 w-4" />
              Profile &amp; account
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <AccountDialog onOpenChange={setAccountOpen} open={accountOpen} />
    </>
  );
}
