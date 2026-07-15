"use client";

import { useState } from "react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/relative-time";
import { toInitials } from "@/components/tasks/task-data";
import {
  banPendingMember,
  rejectPendingMember
} from "@/services/base-workspace.service";
import { AssignRoleDialog } from "@/components/crews/assign-role-dialog";
import type { PendingMember } from "@/types/base";

export function PendingMembersPanel({
  houseId,
  members,
  onChanged
}: {
  houseId: string;
  members: PendingMember[];
  onChanged: () => void;
}) {
  const [assigning, setAssigning] = useState<PendingMember | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (members.length === 0) {
    return null;
  }

  async function handleReject(member: PendingMember) {
    if (!window.confirm(`Reject ${member.name}'s request to join?`)) {
      return;
    }
    setBusyId(member.membershipId);
    try {
      await rejectPendingMember(houseId, member.membershipId);
      onChanged();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not reject this member."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleBan(member: PendingMember) {
    if (
      !window.confirm(
        `Ban ${member.name}? They won't be able to join this house again.`
      )
    ) {
      return;
    }
    setBusyId(member.membershipId);
    try {
      await banPendingMember(houseId, member.membershipId);
      onChanged();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not ban this member."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardPanel title={`Pending Members (${members.length})`}>
      <div className="grid gap-3 p-5">
        {members.map((member) => (
          <div
            className="grid gap-2 rounded-xl border border-black/[0.06] p-3 dark:border-white/[0.08]"
            key={member.membershipId}
          >
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                {member.avatarUrl ? (
                  <AvatarImage alt="" src={member.avatarUrl} />
                ) : null}
                <AvatarFallback>{toInitials(member.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                  {member.name}
                </p>
                <p className="truncate text-xs text-[#8a90a3] dark:text-[#7d8299]">
                  {member.username ? `@${member.username} · ` : ""}
                  {formatRelativeTime(member.joinedAt)}
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button
                className="flex-1 rounded-lg bg-[#654cff] py-1.5 text-xs font-bold text-white hover:bg-[#5a41ea]"
                disabled={busyId === member.membershipId}
                onClick={() => setAssigning(member)}
                type="button"
              >
                Assign Role
              </button>
              <button
                className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
                disabled={busyId === member.membershipId}
                onClick={() => handleReject(member)}
                type="button"
              >
                Reject
              </button>
              <button
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                disabled={busyId === member.membershipId}
                onClick={() => handleBan(member)}
                type="button"
              >
                Ban
              </button>
            </div>
          </div>
        ))}
      </div>

      {assigning ? (
        <AssignRoleDialog
          houseId={houseId}
          member={assigning}
          onAssigned={onChanged}
          onOpenChange={(open) => {
            if (!open) {
              setAssigning(null);
            }
          }}
        />
      ) : null}
    </DashboardPanel>
  );
}
