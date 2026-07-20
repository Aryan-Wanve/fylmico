"use client";

import { HardDrive } from "lucide-react";
import type { DriveStatus } from "@/services/drive.service";

export function DriveConnectionBanner({
  status,
  onConnect,
  onDisconnect,
  canManage
}: {
  status: DriveStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  canManage: boolean;
}) {
  if (status.connected) {
    return (
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white/60 px-5 py-4 text-sm dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#22c55e]/10 text-[#16a34a]">
            <HardDrive className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-[#11142c] dark:text-[#f1f2f8]">
              House Google Drive connected
            </p>
            <p className="text-[#8a90a3] dark:text-[#7d8299]">
              Files are organized automatically in{" "}
              {status.email ?? "the connected Drive"}.
            </p>
          </div>
        </div>
        {canManage ? (
          <button
            className="h-9 rounded-xl border border-black/10 px-3 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
            onClick={onDisconnect}
            type="button"
          >
            Disconnect
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--fylmico-accent)]/20 bg-[var(--fylmico-accent)]/5 px-5 py-4 text-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--fylmico-accent)]/10 text-[var(--fylmico-accent)]">
          <HardDrive className="h-4 w-4" />
        </div>
        <div>
          <p className="font-bold text-[#11142c] dark:text-[#f1f2f8]">
            Connect this house&apos;s Google Drive
          </p>
          <p className="text-[#8a90a3] dark:text-[#7d8299]">
            {canManage
              ? "Fylmico will automatically create and manage the folder structure — Clients, Resources, Portfolio, and a private Sensitive folder."
              : "Ask a house Owner to connect Google Drive to unlock uploads."}
          </p>
        </div>
      </div>
      {canManage ? (
        <button
          className="h-9 rounded-xl bg-[var(--fylmico-accent)] px-4 text-sm font-bold text-white hover:bg-[var(--fylmico-accent-strong)]"
          onClick={onConnect}
          type="button"
        >
          Connect Drive
        </button>
      ) : null}
    </div>
  );
}
