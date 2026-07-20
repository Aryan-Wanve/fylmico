"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWorkspace } from "@/services/base-workspace.service";
import { hasSession } from "@/lib/session";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { AppShellGate } from "@/components/layout/app-shell-gate";
import { PromptDialogProvider } from "@/components/ui/prompt-dialog";
import type { WorkspaceSnapshot } from "@/types/base";

export default function AuthenticatedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceSnapshot | null>(null);

  // Session lives in localStorage, unreadable during the server/static
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
    return <AppLoadingState />;
  }

  return (
    <WorkspaceProvider initialWorkspace={workspace}>
      <PromptDialogProvider>
        <AppShellGate>{children}</AppShellGate>
      </PromptDialogProvider>
    </WorkspaceProvider>
  );
}

function AppLoadingState() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f7fb] px-6 text-center dark:bg-[#0e0f18]">
      <div className="grid w-full max-w-sm gap-5 rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1rem_3rem_rgba(53,45,124,0.06)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[var(--fylmico-accent)]/10 text-[var(--fylmico-accent)]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            Loading Fylmico
          </p>
          <p className="mt-1 text-sm text-[#667085] dark:text-[#878ca0]">
            Getting your workspace ready.
          </p>
        </div>
      </div>
    </div>
  );
}
