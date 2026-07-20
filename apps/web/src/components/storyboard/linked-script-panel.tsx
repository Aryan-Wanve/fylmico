"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import type { Script } from "@/types/base";

export function LinkedScriptPanel({ script }: { script: Script }) {
  return (
    <div className="grid min-h-0 gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 dark:border-white/[0.08] dark:bg-[#171a28]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-[var(--fylmico-accent)]" />
          <strong className="truncate text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            {script.title}
          </strong>
        </div>
        <Link
          className="shrink-0 text-xs font-bold text-[var(--fylmico-accent)] hover:underline"
          href="/scripts"
        >
          Open in Scripts
        </Link>
      </div>
      <pre className="max-h-64 overflow-y-auto rounded-xl bg-black/[0.02] p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-[#3a3f57] dark:bg-white/[0.03] dark:text-[#b4b8cc]">
        {script.content.trim() || "This script is empty so far."}
      </pre>
    </div>
  );
}
