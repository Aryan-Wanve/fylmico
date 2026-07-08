import { Sparkles } from "lucide-react";

export function InsightBanner() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#654cff]/15 bg-[#654cff]/[0.06] px-5 py-4">
      <Sparkles className="h-5 w-5 shrink-0 text-[#654cff]" />
      <p className="text-sm font-semibold text-[#3a3f57]">
        You&apos;re doing great! 18% more tasks completed this month! 🚀
      </p>
    </div>
  );
}
