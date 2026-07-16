"use client";

import { useRouter } from "next/navigation";
import {
  Calendar,
  Clapperboard,
  FolderKanban,
  MessageSquare,
  Paperclip
} from "lucide-react";

const ACTIONS = [
  { label: "Open Storyboard", href: "/storyboard", icon: Clapperboard },
  { label: "Open Files", href: "/files", icon: Paperclip },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "My Projects", href: "/projects", icon: FolderKanban }
] as const;

export function QuickActionsPanel() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-3">
      {ACTIONS.map((action) => (
        <button
          className="flex items-center gap-2 rounded-xl border border-black/[0.06] bg-white px-4 py-2.5 text-sm font-bold text-[#4b5268] shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28] dark:text-[#c7cad9]"
          key={action.href}
          onClick={() => router.push(action.href)}
          type="button"
        >
          <action.icon className="h-4 w-4 text-[#654cff]" />
          {action.label}
        </button>
      ))}
    </div>
  );
}
