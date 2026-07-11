"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Copy, LogOut, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { SettingsCard } from "@/components/settings/settings-card";
import { useWorkspace } from "@/lib/workspace-context";
import {
  inviteMember,
  leaveHouse,
  listInvitations,
  revokeInvitation
} from "@/services/base-workspace.service";
import type { HouseInvitation } from "@/types/base";

export function MembersSection() {
  const { activeHouse, refreshWorkspace } = useWorkspace();
  const members = activeHouse?.members ?? [];
  const roles = activeHouse?.roles ?? [];

  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [lastInviteUrl, setLastInviteUrl] = useState("");
  const [invitations, setInvitations] = useState<HouseInvitation[]>([]);
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState("");

  useEffect(() => {
    if (!activeHouse) {
      return;
    }
    listInvitations()
      .then(setInvitations)
      .catch(() => undefined);
  }, [activeHouse]);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsInviting(true);
    setInviteError("");
    setLastInviteUrl("");

    try {
      const invitation = await inviteMember(inviteEmail);
      setInviteEmail("");
      setInvitations((current) => [invitation, ...current]);
      if (invitation.inviteUrl) {
        setLastInviteUrl(invitation.inviteUrl);
        navigator.clipboard?.writeText(invitation.inviteUrl).catch(() => {});
      }
    } catch (error) {
      setInviteError(
        error instanceof Error ? error.message : "Could not send invite."
      );
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRevoke(invitationId: string) {
    try {
      await revokeInvitation(invitationId);
      setInvitations((current) =>
        current.filter((invitation) => invitation.id !== invitationId)
      );
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not revoke invite."
      );
    }
  }

  async function handleLeave() {
    if (
      !window.confirm(
        "Leave this house? You'll lose access to its projects, tasks, and chat."
      )
    ) {
      return;
    }

    setIsLeaving(true);
    setLeaveError("");

    try {
      await leaveHouse();
      await refreshWorkspace();
    } catch (error) {
      setLeaveError(
        error instanceof Error ? error.message : "Could not leave this house."
      );
      setIsLeaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <SettingsCard
        subtitle="Invite a teammate by email. They'll get a link to join this house."
        title="Invite a Member"
      >
        <form className="flex flex-wrap gap-2" onSubmit={handleInvite}>
          <Input
            className="min-w-0 flex-1"
            onChange={(event) => setInviteEmail(event.target.value)}
            placeholder="teammate@example.com"
            type="email"
            value={inviteEmail}
          />
          <Button disabled={isInviting} type="submit">
            <UserPlus className="h-4 w-4" />
            {isInviting ? "Sending..." : "Send Invite"}
          </Button>
        </form>
        {inviteError ? (
          <p className="mt-2 text-sm font-semibold text-red-600">
            {inviteError}
          </p>
        ) : null}
        {lastInviteUrl ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
            <Copy className="h-3.5 w-3.5" />
            Invite link copied to clipboard.
          </p>
        ) : null}

        {invitations.length > 0 ? (
          <div className="mt-5 grid gap-2 border-t border-black/[0.06] pt-4 dark:border-white/[0.08]">
            <h3 className="text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
              Pending Invitations
            </h3>
            {invitations.map((invitation) => (
              <div
                className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] px-3.5 py-2.5 dark:border-white/[0.08]"
                key={invitation.id}
              >
                <span className="min-w-0 truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                  {invitation.email}
                </span>
                <button
                  aria-label="Revoke invitation"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#8a90a3] hover:bg-black/[0.04] hover:text-red-600 dark:text-[#7d8299] dark:hover:bg-white/[0.06]"
                  onClick={() => handleRevoke(invitation.id)}
                  type="button"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </SettingsCard>

      <SettingsCard
        subtitle="Manage who has access to this house and what they can do."
        title="Members & Permissions"
      >
        <div className="grid gap-2">
          {members.map((member) => (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/[0.06] px-3.5 py-3 dark:border-white/[0.08]"
              key={member.id}
            >
              <div className="flex min-w-0 items-center gap-3">
                <AvatarWithStatus
                  label={member.name.slice(0, 2).toUpperCase()}
                  status={member.status}
                  userId={member.id}
                />
                <div className="min-w-0">
                  <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                    {member.name}
                  </strong>
                  <span className="text-xs text-[#8a90a3] capitalize dark:text-[#7d8299]">
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
            <p className="py-6 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
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
              className="rounded-xl border border-black/[0.06] px-3.5 py-3 dark:border-white/[0.08]"
              key={role.id}
            >
              <div className="flex items-center justify-between">
                <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                  {role.name}
                </strong>
                <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
                  {role.memberCount}{" "}
                  {role.memberCount === 1 ? "member" : "members"}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#8a90a3] dark:text-[#7d8299]">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </SettingsCard>

      <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:bg-[#171a28]">
        <h2 className="text-lg font-bold text-red-600">Danger Zone</h2>
        <p className="mt-1 text-sm text-[#8a90a3] dark:text-[#7d8299]">
          Leaving a house removes your access to its projects, tasks, and chat.
          You can rejoin later with an invite.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/40 px-4 py-3.5">
          <div>
            <strong className="block text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
              Leave {activeHouse?.name ?? "this house"}
            </strong>
            <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
              You&apos;ll need a new invite to rejoin.
            </span>
          </div>
          <button
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
            disabled={isLeaving}
            onClick={handleLeave}
            type="button"
          >
            <LogOut className="h-3.5 w-3.5" />
            {isLeaving ? "Leaving..." : "Leave House"}
          </button>
        </div>
        {leaveError ? (
          <p className="mt-2 text-sm font-semibold text-red-600">
            {leaveError}
          </p>
        ) : null}
      </section>
    </div>
  );
}
