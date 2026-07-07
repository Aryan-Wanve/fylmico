"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/workspace-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";

const ONBOARDING_PATH = "/houses/new";

export function AppShellGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { workspace, activeHouse } = useWorkspace();
  const isCompact = pathname === ONBOARDING_PATH;

  useEffect(() => {
    if (!activeHouse && pathname !== ONBOARDING_PATH) {
      router.replace("/houses/new");
    } else if (activeHouse && pathname === ONBOARDING_PATH) {
      router.replace("/");
    }
  }, [activeHouse, pathname, router]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f7fb]">
      <AppSidebar compact={isCompact} user={workspace.user} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AppTopbar compact={isCompact} />
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
