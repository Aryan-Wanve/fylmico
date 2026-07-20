import { COVER_ICONS } from "@/components/projects/project-data";
import type { Project } from "@/types/base";

export function DashboardProjectCard({ project }: { project: Project }) {
  const Icon = project.coverIcon ? COVER_ICONS[project.coverIcon] : null;

  return (
    <article className="w-44 shrink-0">
      <div
        className={`flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${project.coverGradient ?? "from-slate-400 via-slate-600 to-slate-800"}`}
      >
        {Icon ? <Icon className="h-8 w-8 text-white/30" /> : null}
      </div>
      <strong className="mt-2 block truncate text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
        {project.title}
      </strong>
      <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
        {project.type ?? "Untitled"}
      </span>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-[var(--fylmico-accent)]"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-[#5f667d] dark:text-[#a8acbf]">
          {project.progress}%
        </span>
      </div>
    </article>
  );
}
