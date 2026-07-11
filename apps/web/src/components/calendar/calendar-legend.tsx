import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_STYLES
} from "@/components/calendar/calendar-data";

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-black/5 px-6 py-4 dark:border-white/[0.06]">
      {CATEGORY_ORDER.map((category) => (
        <div className="flex items-center gap-2" key={category}>
          <span
            className={`h-2 w-2 rounded-full ${CATEGORY_STYLES[category].dot}`}
          />
          <span className="text-xs font-medium text-[#5f667d] dark:text-[#a8acbf]">
            {CATEGORY_LABELS[category]}
          </span>
        </div>
      ))}
    </div>
  );
}
