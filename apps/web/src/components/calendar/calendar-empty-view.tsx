import { CalendarClock } from "lucide-react";

export function CalendarEmptyView({ label }: { label: string }) {
  return (
    <div className="grid min-h-[28rem] place-items-center rounded-2xl border border-black/[0.06] bg-white text-center shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#654cff]/10 text-[#654cff]">
          <CalendarClock className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-[#11142c] dark:text-[#f1f2f8]">
          {label} view is coming soon
        </h3>
        <p className="mt-1 text-sm text-[#8a90a3] dark:text-[#7d8299]">
          Switch back to Month to see your production schedule.
        </p>
      </div>
    </div>
  );
}
