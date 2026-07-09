"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWorkspace } from "@/services/base-workspace.service";
import { hasSession } from "@/lib/session";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { AppShellGate } from "@/components/layout/app-shell-gate";
import type { WorkspaceSnapshot } from "@/types/base";

export default function AuthenticatedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceSnapshot | null>(null);

  // Session lives in sessionStorage, unreadable during the server/static
  // render. Wait for the post-hydration tick before checking it, otherwise
  // this effect fires once with a false "logged out" reading and redirects
  // to /login before React ever sees the real value.
  useEffect(() => {
    // Deliberate "mounted" flag: the only way to defer a browser-only check
    // until strictly after hydration, which is the point of this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!hasSession()) {
      router.replace("/login");
      return;
    }

    let isMounted = true;

    getWorkspace()
      .then((snapshot) => {
        if (isMounted) {
          setWorkspace(snapshot);
        }
      })
      .catch(() => {
        if (isMounted) {
          router.replace("/login");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isHydrated, router]);

  if (!isHydrated || !hasSession() || !workspace) {
    return null;
  }

  return (
    <WorkspaceProvider initialWorkspace={workspace}>
      <AppShellGate>{children}</AppShellGate>
    </WorkspaceProvider>
  );
}
