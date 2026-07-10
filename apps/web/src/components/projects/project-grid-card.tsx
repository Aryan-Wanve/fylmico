import {
  COVER_ICONS,
  STAGE_BADGE_STYLES,
  isProjectOverdue,
  type Project
} from "@/components/projects/project-data";
import { TeamAvatarStack } from "@/components/projects/team-avatar-stack";
import { ProjectCardMenu } from "@/components/projects/project-card-menu";
import type { HouseMember } from "@/types/base";

export function ProjectGridCard({
  project,
  members,
  onDuplicate,
  onArchive
}: {
  project: Project;
  members: HouseMember[];
  onDuplicate: () => void;
  onArchive: () => void;
}) {
  const Icon = project.coverIcon ? COVER_ICONS[project.coverIcon] : null;
  const overdue = isProjectOverdue(project);

  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-black/[0.06] bg-white p-3 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
      <div className="relative h-36 w-full overflow-hidden rounded-xl">
        <div
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${project.coverGradient ?? "from-slate-400 via-slate-600 to-slate-800"}`}
        >
          {Icon ? <Icon className="h-10 w-10 text-white/30" /> : null}
        </div>
        <span
          className={`absolute top-2.5 right-2.5 rounded-full px-2.5 py-1 text-xs font-bold text-white ${STAGE_BADGE_STYLES[project.stage]}`}
        >
          {project.stage}
        </span>
      </div>

      <div className="flex items-start justify-between gap-2 pt-3">
        <strong className="truncate text-[0.95rem] font-bold text-[#11142c]">
          {project.title}
        </strong>
        <ProjectCardMenu onArchive={onArchive} onDuplicate={onDuplicate} />
      </div>
      <span className="text-xs text-[#8a90a3]">
        {project.type} &bull; {project.genre}
      </span>
      <p className="mt-1.5 line-clamp-2 text-sm text-[#5f667d]">
        {project.description}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full bg-[#654cff]"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-[#5f667d]">
          {project.progress}%
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
        <TeamAvatarStack members={members} teamIds={project.teamIds} />
        <span
          className={`text-xs font-semibold ${overdue ? "text-red-600" : "text-[#8a90a3]"}`}
        >
          {overdue ? "Overdue · " : ""}
          {project.dueDate ?? "TBD"}
        </span>
      </div>
    </article>
  );
}
