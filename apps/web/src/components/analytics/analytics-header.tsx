import type { ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";

export function AnalyticsHeader({ logTimeSlot }: { logTimeSlot?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black text-[#11142c] dark:text-[#f1f2f8]">
          Analytics
        </h1>
        <p className="mt-1 text-[#5f667d] dark:text-[#a8acbf]">
          Track performance, progress and productivity across all your
          productions.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:bg-[#171a28] dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
          type="button"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
        {logTimeSlot}
      </div>
    </div>
  );
}
