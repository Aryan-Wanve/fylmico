import { ChevronDown } from "lucide-react";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import type { UserProfile } from "@/types/base";

export function SidebarUserFooter({ user }: { user: UserProfile }) {
  return (
    <button
      className="flex items-center gap-2.5 rounded-xl px-1.5 py-2 text-left hover:bg-black/[0.03]"
      type="button"
    >
      <AvatarWithStatus
        label={user.avatarLabel}
        status="online"
        userId={user.id}
      />
      <span className="grid min-w-0 flex-1">
        <strong className="truncate text-sm font-bold text-[#12142b]">
          {user.name}
        </strong>
        <span className="text-xs text-[#5f667d]">Director</span>
      </span>
      <ChevronDown className="h-4 w-4 shrink-0 text-[#8a90a3]" />
    </button>
  );
}
