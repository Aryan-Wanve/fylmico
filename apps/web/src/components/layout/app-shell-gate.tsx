"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/workspace-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { PageTransition } from "@/components/layout/page-transition";
import { VerifyEmailBanner } from "@/components/layout/verify-email-banner";
import { WaitingForApprovalPage } from "@/components/houses/waiting-for-approval-page";
import { sendHeartbeat } from "@/services/base-workspace.service";

const DASHBOARD_PATH = "/dashboard";
const HEARTBEAT_INTERVAL_MS = 60_000;
const WELCOME_TOAST_MS = 4_000;

export function AppShellGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { workspace, activeHouse } = useWorkspace();
  const isDashboard = pathname === DASHBOARD_PATH;
  const isPending = Boolean(activeHouse && activeHouse.myRole === null);
  const isCompact = !activeHouse;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [welcomeHouseName, setWelcomeHouseName] = useState<string | null>(null);
  const previousRoleRef = useRef<{
    houseId: string;
    role: string | null;
  } | null>(null);

  useEffect(() => {
    if (!activeHouse && pathname !== DASHBOARD_PATH) {
      router.replace("/dashboard");
    }
  }, [activeHouse, pathname, router]);

  // Detects a pending member's role flipping from null to assigned (polled
  // by WaitingForApprovalPage) and shows a one-time welcome toast - the
  // transition into the real workspace happens automatically below since
  // this component re-renders with the fresh `activeHouse.myRole`.
  useEffect(() => {
    if (!activeHouse) {
      previousRoleRef.current = null;
      return;
    }

    const previous = previousRoleRef.current;
    const justActivated =
      previous?.houseId === activeHouse.id &&
      previous.role === null &&
      activeHouse.myRole !== null;

    previousRoleRef.current = {
      houseId: activeHouse.id,
      role: activeHouse.myRole
    };

    if (justActivated) {
      setWelcomeHouseName(activeHouse.name);
      const timeout = window.setTimeout(
        () => setWelcomeHouseName(null),
        WELCOME_TOAST_MS
      );
      return () => window.clearTimeout(timeout);
    }
  }, [activeHouse]);

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

  // The Dashboard is the house-switcher and must always stay reachable -
  // a pending member sees the waiting screen for their active house
  // everywhere else, but the Dashboard itself still shows the house grid
  // (with a "Waiting for Approval" badge) so they can switch to another
  // house they already have access to.
  if (isPending && activeHouse && !isDashboard) {
    return <WaitingForApprovalPage house={activeHouse} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f7fb] dark:bg-[#0e0f18]">
      {!isDashboard ? (
        <AppSidebar
          compact={isCompact}
          enabledModules={activeHouse?.enabledModules ?? null}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
          user={workspace.user}
        />
      ) : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {!isDashboard ? (
          <AppTopbar
            compact={isCompact}
            onOpenMobileNav={() => setMobileNavOpen(true)}
          />
        ) : null}
        {!isDashboard && !isCompact && !workspace.user.emailVerifiedAt ? (
          <VerifyEmailBanner email={workspace.user.email} />
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </div>
      </div>

      {welcomeHouseName ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#11142c] px-5 py-3 text-sm font-bold text-white shadow-[0_1rem_3rem_rgba(0,0,0,0.25)] dark:bg-white dark:text-[#11142c]">
          Welcome to {welcomeHouseName}!
        </div>
      ) : null}
    </div>
  );
}
