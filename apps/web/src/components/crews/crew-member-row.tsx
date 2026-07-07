import { Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AVATAR_IMAGES,
  DEPARTMENT_META,
  STATUS_META,
  getInitials,
  type CrewMember
} from "@/components/crews/crew-data";
import { CrewCardMenu } from "@/components/crews/crew-card-menu";

export function CrewMemberRow({
  member,
  onRemove
}: {
  member: CrewMember;
  onRemove: () => void;
}) {
  const departmentMeta = DEPARTMENT_META[member.department];
  const DepartmentIcon = departmentMeta.icon;
  const statusMeta = STATUS_META[member.status];
  const avatarImage = member.avatarId ? AVATAR_IMAGES[member.avatarId] : undefined;

  return (
    <div className="flex items-center gap-4 border-b border-black/5 px-4 py-3 last:border-b-0 hover:bg-black/[0.015]">
      <div className="flex w-56 min-w-0 shrink-0 items-center gap-3 sm:w-64">
        <Avatar>
          {avatarImage ? <AvatarImage alt="" src={avatarImage} /> : null}
          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <strong className="block truncate text-sm font-bold text-[#11142c]">
            {member.name}
          </strong>
          <span className="block truncate text-xs text-[#8a90a3]">
            {member.email}
          </span>
        </div>
      </div>

      <span className="hidden w-40 shrink-0 truncate text-sm text-[#4b5268] md:block">
        {member.jobTitle}
      </span>

      <span className="hidden w-40 shrink-0 items-center gap-1.5 truncate text-sm text-[#4b5268] lg:flex">
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
            <strong className="block truncate text-sm font-semibold text-[#11142c]">
              {member.currentProject}
            </strong>
            <span className="flex items-center gap-1.5 text-xs text-[#8a90a3]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#654cff]" />
              {member.projectStage}
            </span>
          </>
        ) : (
          <span className="text-sm text-[#c3c7d4]">—</span>
        )}
      </div>

      <span className="hidden w-36 shrink-0 items-center gap-1.5 text-xs font-medium text-[#4b5268] xl:flex">
        <Calendar className="h-3.5 w-3.5 text-[#8a90a3]" />
        {member.availability}
      </span>

      <CrewCardMenu onRemove={onRemove} />
    </div>
  );
}
