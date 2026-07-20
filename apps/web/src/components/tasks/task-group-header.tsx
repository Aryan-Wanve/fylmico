import { ChevronDown, Plus } from "lucide-react";

export function TaskGroupHeader({
  label,
  dotClassName,
  count,
  collapsed,
  onToggle,
  onAddTask
}: {
  label: string;
  dotClassName: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
  onAddTask?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-black/5 bg-[#fafafd] px-4 py-2.5 dark:border-white/[0.06] dark:bg-[#1b1e2d]">
      <button
        className="flex items-center gap-2"
        onClick={onToggle}
        type="button"
      >
        <ChevronDown
          className={`h-4 w-4 text-[#667085] transition-transform dark:text-[#878ca0] ${collapsed ? "-rotate-90" : ""}`}
        />
        <span className={`h-2.5 w-2.5 rounded-full ${dotClassName}`} />
        <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          {label}
        </strong>
        <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-xs font-bold text-[#4b5268] dark:bg-white/[0.08] dark:text-[#c7cad9]">
          {count}
        </span>
      </button>
      {onAddTask ? (
        <button
          className="flex items-center gap-1 text-xs font-bold text-[var(--fylmico-accent)] hover:text-[var(--fylmico-accent-strong)]"
          onClick={onAddTask}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Task
        </button>
      ) : null}
    </div>
  );
}
