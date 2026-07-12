"use client";

import { HardDrive } from "lucide-react";
import type { DriveStatus } from "@/services/drive.service";

export function DriveConnectionBanner({
  status,
  onConnect,
  onDisconnect
}: {
  status: DriveStatus;
  onConnect: () => void;
  onDisconnect: () => void;
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
              Google Drive connected
            </p>
            <p className="text-[#8a90a3] dark:text-[#7d8299]">
              Uploads are saved to the Fylmico folder in{" "}
              {status.email ?? "your Drive"}.
            </p>
          </div>
        </div>
        <button
          className="h-9 rounded-xl border border-black/10 px-3 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
          onClick={onDisconnect}
          type="button"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#654cff]/20 bg-[#654cff]/5 px-5 py-4 text-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#654cff]/10 text-[#654cff]">
          <HardDrive className="h-4 w-4" />
        </div>
        <div>
          <p className="font-bold text-[#11142c] dark:text-[#f1f2f8]">
            Connect your Google Drive
          </p>
          <p className="text-[#8a90a3] dark:text-[#7d8299]">
            Files you upload here are stored in a Fylmico folder in your own
            Drive — not on our servers.
          </p>
        </div>
      </div>
      <button
        className="h-9 rounded-xl bg-[#654cff] px-4 text-sm font-bold text-white hover:bg-[#5a41ea]"
        onClick={onConnect}
        type="button"
      >
        Connect Drive
      </button>
    </div>
  );
}
