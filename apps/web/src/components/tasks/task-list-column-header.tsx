export function TaskListColumnHeader() {
  return (
    <div className="flex items-center gap-4 border-b border-black/5 px-4 py-2.5 text-xs font-bold tracking-wide text-[#8a90a3] uppercase">
      <span className="w-4 shrink-0" />
      <span className="min-w-0 flex-1">Task</span>
      <span className="hidden w-32 shrink-0 sm:block">Assignee</span>
      <span className="hidden w-36 shrink-0 md:block">Project</span>
      <span className="hidden w-20 shrink-0 sm:block">Due Date</span>
      <span className="hidden w-20 shrink-0 lg:block">Priority</span>
      <span className="w-7 shrink-0" />
    </div>
  );
}
