"use client";

import { useRouter } from "next/navigation";
import { CheckSquare, HardDrive, Users } from "lucide-react";
import { formatFileSize } from "@/components/files/file-data";
import {
  COVER_ICONS,
  STAGE_BADGE_STYLES,
  formatDueIn,
  isProjectOverdue,
  type Project
} from "@/components/projects/project-data";
import { PRIORITY_META } from "@/components/tasks/task-data";
import { TeamAvatarStack } from "@/components/projects/team-avatar-stack";
import { ProjectCardMenu } from "@/components/projects/project-card-menu";
import type { HouseMember } from "@/types/base";

export function ProjectGridCard({
  project,
  members,
  onlineUserIds,
  onDuplicate,
  onArchive
}: {
  project: Project;
  members: HouseMember[];
  onlineUserIds: Set<string>;
  onDuplicate: () => void;
  onArchive: () => void;
}) {
  const router = useRouter();
  const Icon = project.coverIcon ? COVER_ICONS[project.coverIcon] : null;
  const overdue = isProjectOverdue(project);
  const onlineCount = project.teamIds.filter((id) =>
    onlineUserIds.has(id)
  ).length;

  return (
    <article
      className="flex min-w-0 cursor-pointer flex-col rounded-2xl border border-black/[0.06] bg-white p-3 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
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
        <span
          className={`absolute top-2.5 left-2.5 rounded-full px-2.5 py-1 text-xs font-bold ${PRIORITY_META[project.priority].badge}`}
        >
          {PRIORITY_META[project.priority].label}
        </span>
      </div>

      <div className="flex items-start justify-between gap-2 pt-3">
        <div className="min-w-0">
          <strong className="truncate text-[0.95rem] font-bold text-[#11142c] dark:text-[#f1f2f8]">
            {project.title}
          </strong>
        </div>
        <div onClick={(event) => event.stopPropagation()}>
          <ProjectCardMenu onArchive={onArchive} onDuplicate={onDuplicate} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-[var(--fylmico-accent)]"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-[#5f667d] dark:text-[#a8acbf]">
          {project.progress}% Complete
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5 text-xs font-semibold text-[#5f667d] dark:text-[#a8acbf]">
        <span className="flex items-center gap-1">
          <CheckSquare className="h-3.5 w-3.5 text-[var(--fylmico-accent)]" />
          {project.completedTaskCount ?? 0}/{project.taskCount ?? 0} Tasks
        </span>
        <span className="flex items-center gap-1">
          <HardDrive className="h-3.5 w-3.5 text-[var(--fylmico-accent)]" />
          {formatFileSize(project.storageBytes ?? 0)}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-[var(--fylmico-accent)]" />
          {onlineCount} Online
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 dark:border-white/[0.06]">
        <TeamAvatarStack members={members} teamIds={project.teamIds} />
        <span
          className={`text-xs font-semibold ${overdue ? "text-red-600" : "text-[#667085] dark:text-[#878ca0]"}`}
        >
          {formatDueIn(project.dueDate)}
        </span>
      </div>
    </article>
  );
}
