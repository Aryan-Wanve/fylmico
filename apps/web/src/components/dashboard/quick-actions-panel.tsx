"use client";

import { useRouter } from "next/navigation";
import {
  Calendar,
  Clapperboard,
  FolderKanban,
  MessageSquare,
  Paperclip
} from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";

const ACTIONS = [
  { label: "Storyboard", href: "/storyboard", icon: Clapperboard },
  { label: "Files", href: "/files", icon: Paperclip },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Projects", href: "/projects", icon: FolderKanban }
] as const;

export function QuickActionsPanel() {
  const router = useRouter();

  return (
    <DashboardPanel title="Quick Actions">
      <div className="grid grid-cols-3 gap-2 p-4">
        {ACTIONS.map((action) => (
          <button
            className="grid place-items-center gap-1.5 rounded-xl p-3 text-center hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
            key={action.href}
            onClick={() => router.push(action.href)}
            type="button"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#654cff]/10 text-[#654cff]">
              <action.icon className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold text-[#4b5268] dark:text-[#c7cad9]">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </DashboardPanel>
  );
}
