"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/workspace-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { PageTransition } from "@/components/layout/page-transition";
import { VerifyEmailBanner } from "@/components/layout/verify-email-banner";
import { sendHeartbeat } from "@/services/base-workspace.service";

const DASHBOARD_PATH = "/dashboard";
const HEARTBEAT_INTERVAL_MS = 60_000;

export function AppShellGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { workspace, activeHouse } = useWorkspace();
  const isCompact = !activeHouse;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!activeHouse && pathname !== DASHBOARD_PATH) {
      router.replace("/dashboard");
    }
  }, [activeHouse, pathname, router]);

  // Close the mobile nav drawer whenever the route changes (a nav click).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing open state to the current route, not deriving render output
    setMobileNavOpen(false);
  }, [pathname]);

  // Keeps `User.lastSeenAt` fresh while the app is open, so presence's
  // "last seen" fallback (used once a user has no live Realtime
  // connection) doesn't go stale during a long active session.
  useEffect(() => {
    sendHeartbeat().catch(() => {
      // Best-effort - a missed heartbeat just leaves last-seen slightly stale.
    });
    const interval = window.setInterval(() => {
      sendHeartbeat().catch(() => {
        // Best-effort, see above.
      });
    }, HEARTBEAT_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f7fb] dark:bg-[#0e0f18]">
      <AppSidebar
        compact={isCompact}
        enabledModules={activeHouse?.enabledModules ?? null}
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
          <VerifyEmailBanner email={workspace.user.email} />
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </div>
      </div>
    </div>
  );
}
