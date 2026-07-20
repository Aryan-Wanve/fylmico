import { Checkbox } from "@/components/ui/checkbox";

export function TaskListColumnHeader({
  allSelected,
  onToggleSelectAll
}: {
  allSelected: boolean;
  onToggleSelectAll: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-black/5 px-4 py-2.5 text-xs font-bold tracking-wide text-[#667085] uppercase dark:border-white/[0.06] dark:text-[#7d8299]">
      <Checkbox
        aria-label="Select all tasks"
        checked={allSelected}
        onCheckedChange={onToggleSelectAll}
      />
      <span className="w-4 shrink-0" />
      <span className="min-w-0 flex-1">Task</span>
      <span className="hidden w-28 shrink-0 sm:block">Assignees</span>
      <span className="hidden w-36 shrink-0 md:block">Project</span>
      <span className="hidden w-20 shrink-0 sm:block">Due Date</span>
      <span className="hidden w-20 shrink-0 lg:block">Priority</span>
      <span className="w-7 shrink-0" />
    </div>
  );
}
