"use client";

import { useRouter } from "next/navigation";
import { formatFileSize } from "@/components/files/file-data";
import {
  COVER_ICONS,
  STAGE_BADGE_STYLES,
  formatDueIn,
  isProjectOverdue,
  type Project
} from "@/components/projects/project-data";
import { TeamAvatarStack } from "@/components/projects/team-avatar-stack";
import { ProjectCardMenu } from "@/components/projects/project-card-menu";
import type { HouseMember } from "@/types/base";

export function ProjectListRow({
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
  const router = useRouter();
  const Icon = project.coverIcon ? COVER_ICONS[project.coverIcon] : null;
  const overdue = isProjectOverdue(project);

  return (
    <div
      className="flex cursor-pointer items-center gap-4 border-b border-black/5 px-4 py-3 last:border-b-0 hover:bg-black/[0.015] dark:border-white/[0.06] dark:hover:bg-white/[0.03]"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
        <div
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${project.coverGradient ?? "from-slate-400 via-slate-600 to-slate-800"}`}
        >
          {Icon ? <Icon className="h-5 w-5 text-white/30" /> : null}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <strong className="block truncate text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          {project.title}
        </strong>
        <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
          {project.completedTaskCount ?? 0}/{project.taskCount ?? 0} tasks
          &bull; {formatFileSize(project.storageBytes ?? 0)}
        </span>
      </div>

      <span
        className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-bold text-white sm:inline-block ${STAGE_BADGE_STYLES[project.stage]}`}
      >
        {project.stage}
      </span>

      <div className="hidden w-32 shrink-0 items-center gap-2 md:flex">
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

      <div className="hidden shrink-0 lg:block">
        <TeamAvatarStack members={members} teamIds={project.teamIds} />
      </div>

      <span
        className={`hidden w-28 shrink-0 text-xs font-semibold sm:block ${overdue ? "text-red-600" : "text-[#8a90a3] dark:text-[#7d8299]"}`}
      >
        {formatDueIn(project.dueDate)}
      </span>

      <div onClick={(event) => event.stopPropagation()}>
        <ProjectCardMenu onArchive={onArchive} onDuplicate={onDuplicate} />
      </div>
    </div>
  );
}
