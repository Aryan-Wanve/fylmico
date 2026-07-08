"use client";

import { useState } from "react";
import { Copy, KeyRound, RefreshCcw } from "lucide-react";

const MOCK_API_KEY = "fylm_sk_live_9f3a2c7d1e6b4890";

export function AdvancedSection() {
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard?.writeText(MOCK_API_KEY).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
        <h2 className="text-lg font-bold text-[#11142c]">API Access</h2>
        <p className="mt-1 text-sm text-[#8a90a3]">
          Use this key to connect Fylmico to external tools.
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-black/[0.06] px-3.5 py-2.5">
          <KeyRound className="h-4 w-4 shrink-0 text-[#8a90a3]" />
          <code className="min-w-0 flex-1 truncate text-sm text-[#3a3f57]">
            {apiKeyVisible
              ? MOCK_API_KEY
              : `${MOCK_API_KEY.slice(0, 12)}${"•".repeat(12)}`}
          </code>
          <button
            className="shrink-0 text-xs font-bold text-[#654cff]"
            onClick={() => setApiKeyVisible((value) => !value)}
            type="button"
          >
            {apiKeyVisible ? "Hide" : "Show"}
          </button>
          <button
            aria-label="Copy API key"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#8a90a3] hover:bg-black/[0.04]"
            onClick={handleCopy}
            type="button"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
        {copied ? (
          <p className="mt-2 text-xs font-semibold text-emerald-600">
            Copied to clipboard.
          </p>
        ) : null}

        <button
          className="mt-3 flex items-center gap-2 rounded-lg border border-black/10 px-3.5 py-1.5 text-xs font-bold text-[#4b5268] hover:bg-black/[0.03]"
          type="button"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Regenerate Key
        </button>
      </section>

      <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
        <h2 className="text-lg font-bold text-red-600">Danger Zone</h2>
        <p className="mt-1 text-sm text-[#8a90a3]">
          These actions are permanent and cannot be undone.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/40 px-4 py-3.5">
          <div>
            <strong className="block text-sm font-semibold text-[#11142c]">
              Reset workspace
            </strong>
            <span className="text-xs text-[#8a90a3]">
              Clears all projects, tasks, and files from this house.
            </span>
          </div>
          <button
            className="shrink-0 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700"
            onClick={() =>
              window.confirm(
                "This would reset the workspace. This is a preview — no data will actually be deleted."
              )
            }
            type="button"
          >
            Reset Workspace
          </button>
        </div>
      </section>
    </div>
  );
}
