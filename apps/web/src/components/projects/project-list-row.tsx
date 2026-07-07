import Image from "next/image";
import {
  STAGE_BADGE_STYLES,
  isProjectOverdue,
  type Project
} from "@/components/projects/project-data";
import { TeamAvatarStack } from "@/components/projects/team-avatar-stack";
import { ProjectCardMenu } from "@/components/projects/project-card-menu";

export function ProjectListRow({
  project,
  onDuplicate,
  onArchive
}: {
  project: Project;
  onDuplicate: () => void;
  onArchive: () => void;
}) {
  const Icon = project.coverIcon;
  const overdue = isProjectOverdue(project);

  return (
    <div className="flex items-center gap-4 border-b border-black/5 px-4 py-3 last:border-b-0 hover:bg-black/[0.015]">
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
        {project.image ? (
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="80px"
            src={project.image}
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${project.coverGradient}`}
          >
            {Icon ? <Icon className="h-5 w-5 text-white/30" /> : null}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <strong className="block truncate text-sm font-bold text-[#11142c]">
          {project.title}
        </strong>
        <span className="text-xs text-[#8a90a3]">
          {project.type} &bull; {project.genre}
        </span>
      </div>

      <span
        className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-white sm:inline-block ${STAGE_BADGE_STYLES[project.stage]}`}
      >
        {project.stage}
      </span>

      <div className="hidden w-32 shrink-0 items-center gap-2 md:flex">
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

      <div className="hidden shrink-0 lg:block">
        <TeamAvatarStack
          overflow={project.teamOverflow}
          teamIds={project.teamIds}
        />
      </div>

      <span
        className={`hidden w-24 shrink-0 text-xs font-semibold sm:block ${overdue ? "text-red-600" : "text-[#8a90a3]"}`}
      >
        {project.dueDate}
      </span>

      <ProjectCardMenu onArchive={onArchive} onDuplicate={onDuplicate} />
    </div>
  );
}
