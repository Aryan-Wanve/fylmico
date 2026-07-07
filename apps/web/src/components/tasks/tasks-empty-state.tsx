import { ListChecks } from "lucide-react";

export function TasksEmptyState() {
  return (
    <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-black/10 bg-white/60 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-[#654cff]/10 text-[#654cff]">
        <ListChecks className="h-6 w-6" />
      </div>
      <strong className="text-sm font-bold text-[#11142c]">
        No tasks match these filters
      </strong>
      <p className="max-w-xs text-sm text-[#8a90a3]">
        Try a different tab or clear the priority filters to see more tasks.
      </p>
    </div>
  );
}
