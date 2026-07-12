import { Plus } from "lucide-react";

export function ProjectsHeader({ onNewProject }: { onNewProject: () => void }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-black text-[#11142c] sm:text-3xl dark:text-[#f1f2f8]">
          Projects
        </h1>
        <p className="mt-1 text-sm text-[#5f667d] sm:text-base dark:text-[#a8acbf]">
          All your productions in one place. Plan, track and bring stories to
          life.
        </p>
      </div>
      <button
        className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#654cff] px-4 text-sm font-bold text-white hover:bg-[#5a41ea]"
        onClick={onNewProject}
        type="button"
      >
        <Plus className="h-4 w-4" />
        New Project
      </button>
    </div>
  );
}
