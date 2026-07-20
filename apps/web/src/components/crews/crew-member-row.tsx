"use client";

import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DEPARTMENT_META,
  ROLE_CATEGORY_META,
  STATUS_META,
  getInitials,
  type CrewMember
} from "@/components/crews/crew-data";
import { CrewCardMenu } from "@/components/crews/crew-card-menu";

export function CrewMemberRow({
  member,
  onRemove,
  onMessage,
  onEdit
}: {
  member: CrewMember;
  onRemove: () => void;
  onMessage: () => void;
  onEdit: () => void;
}) {
  const router = useRouter();
  const departmentMeta = DEPARTMENT_META[member.department];
  const DepartmentIcon = departmentMeta.icon;
  const statusMeta = STATUS_META[member.status];
  const roleMeta = ROLE_CATEGORY_META[member.roleCategory];

  return (
    <div
      className="flex cursor-pointer items-center gap-4 border-b border-black/5 px-4 py-3 last:border-b-0 hover:bg-black/[0.015] dark:border-white/[0.06] dark:hover:bg-white/[0.03]"
      onClick={() => router.push(`/crews/${member.id}`)}
    >
      <div className="flex w-56 min-w-0 shrink-0 items-center gap-3 sm:w-64">
        <Avatar>
          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <strong className="block truncate text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            {member.name}
          </strong>
          <span className="block truncate text-xs text-[#667085] dark:text-[#878ca0]">
            {member.email}
          </span>
        </div>
      </div>

      <span className="hidden w-40 shrink-0 items-center gap-2 md:flex">
        <span className="truncate text-sm text-[#4b5268] dark:text-[#c7cad9]">
          {member.jobTitle}
        </span>
        <span
          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[0.65rem] font-bold ${roleMeta.badge}`}
        >
          {member.roleCategory}
        </span>
      </span>

      <span className="hidden w-40 shrink-0 items-center gap-1.5 truncate text-sm text-[#4b5268] lg:flex dark:text-[#c7cad9]">
        <span
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${departmentMeta.bg} ${departmentMeta.color}`}
        >
          <DepartmentIcon className="h-3.5 w-3.5" />
        </span>
        {member.department}
      </span>

      <span
        className={`w-24 shrink-0 rounded-md px-2 py-0.5 text-center text-xs font-bold ${statusMeta.badge}`}
      >
        {statusMeta.label}
      </span>

      <div className="hidden min-w-0 flex-1 xl:block">
        {member.currentProject ? (
          <>
            <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
              {member.currentProject}
            </strong>
            <span className="flex items-center gap-1.5 text-xs text-[#667085] dark:text-[#878ca0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--fylmico-accent)]" />
              {member.projectStage}
            </span>
          </>
        ) : (
          <span className="text-sm text-[#c3c7d4] dark:text-[#5c6178]">—</span>
        )}
      </div>

      <span className="hidden w-36 shrink-0 items-center gap-1.5 text-xs font-medium text-[#4b5268] xl:flex dark:text-[#c7cad9]">
        <Calendar className="h-3.5 w-3.5 text-[#667085] dark:text-[#878ca0]" />
        {member.availability}
      </span>

      <div onClick={(event) => event.stopPropagation()}>
        <CrewCardMenu
          onEdit={onEdit}
          onMessage={onMessage}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
}
