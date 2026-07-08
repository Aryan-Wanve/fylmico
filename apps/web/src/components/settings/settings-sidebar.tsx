"use client";

import {
  CheckCircle2,
  Download,
  FileOutput,
  HelpCircle,
  ScrollText,
  Sparkles,
  Trash2
} from "lucide-react";
import {
  storageTotalGb,
  storageUsedGb,
  workspacePlan
} from "@/components/settings/settings-data";

export function SettingsSidebar({
  onDeleteAccount
}: {
  onDeleteAccount: () => void;
}) {
  const storagePercent = Math.round((storageUsedGb / storageTotalGb) * 100);

  return (
    <aside className="grid content-start gap-6">
      <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#654cff]/10 text-[#654cff]">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <strong className="text-sm font-bold text-[#11142c]">
            Workspace Plan
          </strong>
        </div>

        <div className="mt-4">
          <strong className="text-base font-black text-[#11142c]">
            {workspacePlan.name}
          </strong>
          <p className="text-xs text-[#8a90a3]">You&apos;re on the Pro plan</p>
        </div>

        <ul className="mt-3 grid gap-1.5">
          {workspacePlan.features.map((feature) => (
            <li
              className="flex items-center gap-2 text-sm text-[#3a3f57]"
              key={feature}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#654cff]" />
              {feature}
            </li>
          ))}
        </ul>

        <button
          className="mt-4 w-full rounded-lg border border-black/10 py-2 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03]"
          type="button"
        >
          Manage Plan
        </button>
      </div>

      <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
        <strong className="text-sm font-bold text-[#11142c]">
          Workspace Storage
        </strong>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-[#5f667d]">
            {storageUsedGb} GB of {storageTotalGb} GB used
          </span>
          <span className="font-bold text-[#11142c]">{storagePercent}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full bg-[#654cff]"
            style={{ width: `${storagePercent}%` }}
          />
        </div>
        <button
          className="mt-4 w-full rounded-lg border border-black/10 py-2 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03]"
          type="button"
        >
          Manage Storage
        </button>
      </div>

      <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
        <strong className="text-sm font-bold text-[#11142c]">
          Quick Actions
        </strong>
        <div className="mt-3 grid gap-1">
          <button
            className="flex items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-black/[0.03]"
            type="button"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold text-[#3a3f57]">
              <Download className="h-4 w-4 text-[#8a90a3]" />
              Download My Data
            </span>
          </button>
          <button
            className="flex items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-black/[0.03]"
            type="button"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold text-[#3a3f57]">
              <FileOutput className="h-4 w-4 text-[#8a90a3]" />
              Export Workspace Data
            </span>
          </button>
          <button
            className="flex items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-black/[0.03]"
            type="button"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold text-[#3a3f57]">
              <ScrollText className="h-4 w-4 text-[#8a90a3]" />
              View Audit Logs
            </span>
          </button>
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

      <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[#8a90a3]" />
          <strong className="text-sm font-bold text-[#11142c]">
            Need Help?
          </strong>
        </div>
        <p className="mt-2 text-sm text-[#8a90a3]">
          Visit our Help Center or contact support.
        </p>
        <button
          className="mt-3 w-full rounded-lg bg-[#654cff] py-2 text-sm font-bold text-white hover:bg-[#5a41ea]"
          type="button"
        >
          Go to Help Center
        </button>
      </div>
    </aside>
  );
}
