import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { COVER_ICONS } from "@/components/projects/project-data";
import type { AnalyticsTopProject } from "@/types/base";

export function TopActiveProjectsPanel({
  projects
}: {
  projects: AnalyticsTopProject[];
}) {
  return (
    <DashboardPanel title="Top Active Projects">
      {projects.length === 0 ? (
        <p className="p-6 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
          No active projects yet.
        </p>
      ) : (
        <div className="grid gap-1 p-2">
          {projects.map((project) => {
            const Icon = project.coverIcon
              ? COVER_ICONS[project.coverIcon as keyof typeof COVER_ICONS]
              : null;

            return (
              <div
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                key={project.id}
              >
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${project.coverGradient ?? "from-slate-400 via-slate-600 to-slate-800"}`}
                >
                  {Icon ? <Icon className="h-4 w-4 text-white/70" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                    {project.title}
                  </strong>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                    <div
                      className="h-full rounded-full bg-[#654cff]"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-xs font-bold text-[#5f667d] dark:text-[#a8acbf]">
                  {project.progress}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </DashboardPanel>
  );
}
