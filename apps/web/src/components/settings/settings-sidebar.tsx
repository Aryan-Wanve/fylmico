"use client";

import { useEffect, useState } from "react";
import {
  Download,
  FileOutput,
  HelpCircle,
  ScrollText,
  Sparkles,
  Trash2
} from "lucide-react";
import { formatFileSize } from "@/components/files/file-data";
import { getFilesSummary } from "@/services/base-workspace.service";

export function SettingsSidebar({
  onDeleteAccount
}: {
  onDeleteAccount: () => void;
}) {
  const [usedBytes, setUsedBytes] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    getFilesSummary()
      .then((summary) => {
        if (!cancelled) {
          setUsedBytes(summary.usedBytes);
        }
      })
      .catch(() => {
        // Storage card fails quietly.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className="grid content-start gap-6">
      <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#654cff]/10 text-[#654cff]">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            Workspace Plan
          </strong>
        </div>

        <div className="mt-4">
          <strong className="text-base font-black text-[#11142c] dark:text-[#f1f2f8]">
            Free
          </strong>
          <p className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
            Paid plans are coming soon.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          Workspace Storage
        </strong>
        <p className="mt-3 text-sm text-[#5f667d] dark:text-[#a8acbf]">
          {usedBytes !== null ? formatFileSize(usedBytes) || "0 B" : "—"} used
        </p>
      </div>

      <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          Quick Actions
        </strong>
        <div className="mt-3 grid gap-1">
          <div className="flex items-center justify-between rounded-lg px-2 py-2 text-left opacity-50">
            <span className="flex items-center gap-2.5 text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
              <Download className="h-4 w-4 text-[#8a90a3] dark:text-[#7d8299]" />
              Download My Data
            </span>
            <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
              Soon
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg px-2 py-2 text-left opacity-50">
            <span className="flex items-center gap-2.5 text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
              <FileOutput className="h-4 w-4 text-[#8a90a3] dark:text-[#7d8299]" />
              Export Workspace Data
            </span>
            <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
              Soon
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg px-2 py-2 text-left opacity-50">
            <span className="flex items-center gap-2.5 text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
              <ScrollText className="h-4 w-4 text-[#8a90a3] dark:text-[#7d8299]" />
              View Audit Logs
            </span>
            <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
              Soon
            </span>
          </div>
          <button
            className="flex items-center justify-between rounded-lg px-2 py-2 text-left text-red-600 hover:bg-red-50"
            onClick={onDeleteAccount}
            type="button"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <Trash2 className="h-4 w-4" />
              Delete Account
            </span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[#8a90a3] dark:text-[#7d8299]" />
          <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            Need Help?
          </strong>
        </div>
        <p className="mt-2 text-sm text-[#8a90a3] dark:text-[#7d8299]">
          Visit our Help Center or contact support.
        </p>
      </div>
    </aside>
  );
}
