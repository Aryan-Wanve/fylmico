import { Calendar, Download, SlidersHorizontal } from "lucide-react";

export function AnalyticsHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black text-[#11142c]">Analytics</h1>
        <p className="mt-1 text-[#5f667d]">
          Track performance, progress and productivity across all your
          productions.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03]"
          type="button"
        >
          <Calendar className="h-4 w-4" />
          Jul 1 – Jul 7, 2026
        </button>
        <button
          className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03]"
          type="button"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
        <button
          className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03]"
          type="button"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
    </div>
  );
}
