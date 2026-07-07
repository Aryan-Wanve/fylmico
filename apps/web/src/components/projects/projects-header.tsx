import { Plus } from "lucide-react";

export function ProjectsHeader({ onNewProject }: { onNewProject: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black text-[#11142c]">Projects</h1>
        <p className="mt-1 text-[#5f667d]">
          All your productions in one place. Plan, track and bring stories to
          life.
        </p>
      </div>
      <button
        className="flex h-10 items-center gap-2 rounded-xl bg-[#654cff] px-4 text-sm font-bold text-white hover:bg-[#5a41ea]"
        onClick={onNewProject}
        type="button"
      >
        <Plus className="h-4 w-4" />
        New Project
      </button>
    </div>
  );
}
