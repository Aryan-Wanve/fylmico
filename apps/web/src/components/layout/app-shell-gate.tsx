"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/workspace-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { PageTransition } from "@/components/layout/page-transition";
import { VerifyEmailBanner } from "@/components/layout/verify-email-banner";

const ONBOARDING_PATH = "/houses/new";

export function AppShellGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { workspace, activeHouse } = useWorkspace();
  const isCompact = pathname === ONBOARDING_PATH;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!activeHouse && pathname !== ONBOARDING_PATH) {
      router.replace("/houses/new");
    } else if (activeHouse && pathname === ONBOARDING_PATH) {
      router.replace("/");
    }
  }, [activeHouse, pathname, router]);

  // Close the mobile nav drawer whenever the route changes (a nav click).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing open state to the current route, not deriving render output
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f7fb] dark:bg-[#0e0f18]">
      <AppSidebar
        compact={isCompact}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        user={workspace.user}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AppTopbar
          compact={isCompact}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        {!isCompact && !workspace.user.emailVerifiedAt ? (
          <VerifyEmailBanner />
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </div>
      </div>
    </div>
  );
}
