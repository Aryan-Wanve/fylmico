import type { ReactNode } from "react";
import { Download } from "lucide-react";

const RANGE_OPTIONS = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" }
];

export function AnalyticsHeader({
  logTimeSlot,
  rangeDays,
  onRangeChange,
  onExportCsv
}: {
  logTimeSlot?: ReactNode;
  rangeDays: number;
  onRangeChange: (days: number) => void;
  onExportCsv: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-black text-[#11142c] sm:text-3xl dark:text-[#f1f2f8]">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-[#5f667d] sm:text-base dark:text-[#a8acbf]">
          Track performance, progress and productivity across all your
          productions.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <select
          className="h-9 rounded-lg border border-black/10 bg-white px-3 text-sm font-semibold text-[#4b5268] outline-none hover:bg-black/[0.03] dark:border-white/10 dark:bg-[#171a28] dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
          onChange={(event) => onRangeChange(Number(event.target.value))}
          value={rangeDays}
        >
          {RANGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:bg-[#171a28] dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
          onClick={onExportCsv}
          type="button"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
        {logTimeSlot}
      </div>
    </div>
  );
}
