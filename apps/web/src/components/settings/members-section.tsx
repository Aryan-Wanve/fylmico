"use client";

import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { SettingsCard } from "@/components/settings/settings-card";
import { useWorkspace } from "@/lib/workspace-context";

export function MembersSection() {
  const { activeHouse } = useWorkspace();
  const members = activeHouse?.members ?? [];
  const roles = activeHouse?.roles ?? [];

  return (
    <div className="grid gap-6">
      <SettingsCard
        action={
          <Button onClick={() => window.prompt("Invite by email")}>
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        }
        subtitle="Manage who has access to this house and what they can do."
        title="Members & Permissions"
      >
        <div className="grid gap-2">
          {members.map((member) => (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/[0.06] px-3.5 py-3"
              key={member.id}
            >
              <div className="flex min-w-0 items-center gap-3">
                <AvatarWithStatus
                  label={member.name.slice(0, 2).toUpperCase()}
                  status={member.status}
                  userId={member.id}
                />
                <div className="min-w-0">
                  <strong className="block truncate text-sm font-semibold text-[#11142c]">
                    {member.name}
                  </strong>
                  <span className="text-xs text-[#8a90a3] capitalize">
                    {member.status}
                  </span>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-[#654cff]/10 px-2.5 py-1 text-xs font-bold text-[#654cff]">
                {member.role}
              </span>
            </div>
          ))}
          {members.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#8a90a3]">
              No members yet.
            </p>
          ) : null}
        </div>
      </SettingsCard>

      <SettingsCard
        subtitle="What each role can see and do in this house."
        title="Roles"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {roles.map((role) => (
            <div
              className="rounded-xl border border-black/[0.06] px-3.5 py-3"
              key={role.id}
            >
              <div className="flex items-center justify-between">
                <strong className="text-sm font-bold text-[#11142c]">
                  {role.name}
                </strong>
                <span className="text-xs font-semibold text-[#8a90a3]">
                  {role.memberCount}{" "}
                  {role.memberCount === 1 ? "member" : "members"}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#8a90a3]">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}
