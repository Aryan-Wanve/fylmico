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
    <div className="flex items-center justify-between gap-2 border-b border-black/5 bg-[#fafafd] px-4 py-2.5">
      <button
        className="flex items-center gap-2"
        onClick={onToggle}
        type="button"
      >
        <ChevronDown
          className={`h-4 w-4 text-[#8a90a3] transition-transform ${collapsed ? "-rotate-90" : ""}`}
        />
        <span className={`h-2.5 w-2.5 rounded-full ${dotClassName}`} />
        <strong className="text-sm font-bold text-[#11142c]">{label}</strong>
        <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-xs font-bold text-[#4b5268]">
          {count}
        </span>
      </button>
      {onAddTask ? (
        <button
          className="flex items-center gap-1 text-xs font-bold text-[#654cff] hover:text-[#5a41ea]"
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
