"use client";

import { useEffect, useState } from "react";
import { Clock3, Copy, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { toInitials } from "@/components/tasks/task-data";
import { useWorkspace } from "@/lib/workspace-context";
import type { House } from "@/types/base";

const POLL_INTERVAL_MS = 5_000;

export function WaitingForApprovalPage({ house }: { house: House }) {
  const { refreshWorkspace } = useWorkspace();
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const admins = house.members.filter(
    (member) => member.role === "Owner" || member.role === "Admin"
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      refreshWorkspace().catch(() => {
        // Best-effort - the next poll will retry.
      });
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [refreshWorkspace]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshWorkspace();
    } finally {
      setRefreshing(false);
    }
  }

  function handleCopyInvite() {
    const url = `${window.location.origin}/houses/join/${house.inviteCode}`;
    navigator.clipboard
      .writeText(`Join ${house.name} on Fylmico: ${url}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Clipboard access can fail silently - the user can still copy manually.
      });
  }

  return (
    <div className="grid h-screen place-items-center bg-[#f7f7fb] p-6 dark:bg-[#0e0f18]">
      <div className="w-full max-w-md rounded-3xl border border-black/[0.06] bg-white p-10 text-center shadow-[0_1.5rem_5rem_rgba(53,45,124,0.08)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#7257ff] to-[#563df0] text-white">
          <Home className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-xl font-black text-[#11142c] dark:text-[#f1f2f8]">
          {house.name}
        </h1>

        <h2 className="mt-6 text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
          You&apos;re almost in.
        </h2>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
          Your account has joined this house successfully. An administrator now
          needs to assign your role before you can access projects, chats, and
          files.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-[var(--fylmico-accent)]/20 bg-[var(--fylmico-accent)]/5 px-4 py-3">
          <Clock3 className="h-4 w-4 text-[var(--fylmico-accent)]" />
          <span className="text-sm font-bold text-[var(--fylmico-accent)]">
            Current Status: Waiting for Role Assignment
          </span>
        </div>

        {admins.length > 0 ? (
          <div className="mt-6">
            <p className="text-xs font-bold tracking-wide text-[#667085] uppercase dark:text-[#878ca0]">
              Admins online
            </p>
            <div className="mt-2 flex justify-center -space-x-2">
              {admins.map((admin) => (
                <AvatarWithStatus
                  imageUrl={admin.avatarUrl}
                  key={admin.id}
                  label={toInitials(admin.name)}
                  status={admin.status}
                  userId={admin.id}
                />
              ))}
            </div>
          </div>
        ) : null}

        <p className="mt-6 text-xs text-[#667085] dark:text-[#878ca0]">
          Only house admins can grant access. Please contact an administrator if
          this takes too long.
        </p>

        <div className="mt-6 flex gap-2">
          <Button
            className="h-10 flex-1 rounded-lg border-black/10 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
            onClick={handleCopyInvite}
            variant="outline"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied" : "Copy Invite Info"}
          </Button>
          <Button
            className="h-10 flex-1 rounded-lg bg-gradient-to-br from-[var(--fylmico-accent)] to-[#5b3ff0] text-sm font-bold text-white hover:opacity-95"
            disabled={refreshing}
            onClick={handleRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {refreshing ? "Refreshing..." : "Refresh Status"}
          </Button>
        </div>
      </div>
    </div>
  );
}
