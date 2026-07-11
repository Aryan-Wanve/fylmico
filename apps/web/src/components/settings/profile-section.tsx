"use client";

import { useEffect, useState } from "react";
import { Laptop, MoreVertical, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { SettingsCard } from "@/components/settings/settings-card";
import { useWorkspace } from "@/lib/workspace-context";
import {
  changePassword,
  listSessions,
  revokeSession,
  updateMe
} from "@/services/base-workspace.service";
import type { AccountSession } from "@/types/base";

function formatLastActive(createdAt: string): string {
  return new Date(createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function ProfileSection() {
  const { workspace, refreshWorkspace } = useWorkspace();
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(workspace.user.name);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [sessions, setSessions] = useState<AccountSession[]>([]);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;

    listSessions()
      .then((data) => {
        if (!cancelled) {
          setSessions(data);
        }
      })
      .catch(() => {
        // Sessions list fails quietly - it's a secondary view.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function startEditing() {
    setDraftName(workspace.user.name);
    setProfileError("");
    setIsEditing(true);
  }

  async function saveProfile() {
    if (!draftName.trim()) {
      setProfileError("Enter your name.");
      return;
    }

    setSavingProfile(true);
    setProfileError("");

    try {
      await updateMe({ name: draftName.trim() });
      await refreshWorkspace();
      setIsEditing(false);
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Could not update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleUpdatePassword() {
    setPasswordSuccess(false);
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Fill in all three fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Could not update password."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleRevoke(sessionId: string) {
    try {
      await revokeSession(sessionId);
      setSessions((current) =>
        current.filter((session) => session.id !== sessionId)
      );
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not revoke session."
      );
    }
  }

  return (
    <div className="grid gap-6">
      <SettingsCard
        action={
          isEditing ? (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                disabled={savingProfile}
              >
                Cancel
              </Button>
              <Button disabled={savingProfile} onClick={saveProfile}>
                {savingProfile ? "Saving..." : "Save"}
              </Button>
            </div>
          ) : (
            <Button onClick={startEditing} variant="outline">
              Edit Profile
            </Button>
          )
        }
        subtitle="Update your personal information and account settings."
        title="Profile & Account"
      >
        <div className="flex flex-wrap items-start gap-8">
          <AvatarWithStatus
            label={workspace.user.avatarLabel}
            size="lg"
            userId={workspace.user.id}
          />

          {isEditing ? (
            <div className="grid min-w-[16rem] flex-1 gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <Label className="text-xs font-bold text-[#8a90a3] uppercase">
                  Full Name
                </Label>
                <Input
                  onChange={(event) => setDraftName(event.target.value)}
                  value={draftName}
                />
              </label>
            </div>
          ) : (
            <div className="grid flex-1 gap-2.5">
              <ProfileField label="Full Name" value={workspace.user.name} />
              <ProfileField
                label="Email"
                value={
                  <span className="flex flex-wrap items-center gap-2">
                    {workspace.user.email}
                  </span>
                }
              />
            </div>
          )}
        </div>

        {profileError ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-600">
            {profileError}
          </p>
        ) : null}
      </SettingsCard>

      <SettingsCard
        subtitle="Update your password to keep your account secure."
        title="Change Password"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-1.5">
            <Label className="text-sm font-semibold text-[#3a3f57]">
              Current Password
            </Label>
            <Input
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Enter current password"
              type="password"
              value={currentPassword}
            />
          </label>
          <label className="grid gap-1.5">
            <Label className="text-sm font-semibold text-[#3a3f57]">
              New Password
            </Label>
            <Input
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Enter new password"
              type="password"
              value={newPassword}
            />
          </label>
          <label className="grid gap-1.5">
            <Label className="text-sm font-semibold text-[#3a3f57]">
              Confirm New Password
            </Label>
            <Input
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              type="password"
              value={confirmPassword}
            />
          </label>
        </div>

        {passwordError ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-600">
            {passwordError}
          </p>
        ) : null}
        {passwordSuccess ? (
          <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-700">
            Password updated successfully.
          </p>
        ) : null}

        <Button
          className="mt-4"
          disabled={changingPassword}
          onClick={handleUpdatePassword}
        >
          {changingPassword ? "Updating..." : "Update Password"}
        </Button>
      </SettingsCard>

      <SettingsCard
        subtitle="Manage your active sessions across devices."
        title="Account Sessions"
      >
        <div className="grid gap-2">
          {sessions.length > 0 ? (
            sessions.map((session) => {
              const DeviceIcon = session.userAgent?.includes("Mobile")
                ? Smartphone
                : Laptop;

              return (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/[0.06] px-3.5 py-3"
                  key={session.id}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-black/[0.04] text-[#4b5268]">
                      <DeviceIcon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <span className="flex items-center gap-2">
                        <strong className="truncate text-sm font-semibold text-[#11142c]">
                          {session.userAgent ?? "Unknown device"}
                        </strong>
                        {session.current ? (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            Current Session
                          </Badge>
                        ) : null}
                      </span>
                      <span className="text-xs text-[#8a90a3]">
                        IP {session.ipAddress ?? "unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`text-xs font-semibold ${session.current ? "text-emerald-600" : "text-[#8a90a3]"}`}
                    >
                      {session.current
                        ? "Active now"
                        : formatLastActive(session.createdAt)}
                    </span>
                    {!session.current ? (
                      <button
                        className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-100"
                        onClick={() => handleRevoke(session.id)}
                        type="button"
                      >
                        Revoke
                      </button>
                    ) : null}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <button
                            aria-label="Session actions"
                            className="grid h-7 w-7 place-items-center rounded-full text-[#8a90a3] hover:bg-black/[0.04]"
                            type="button"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                          disabled={session.current}
                          onClick={() => handleRevoke(session.id)}
                          variant="destructive"
                        >
                          Revoke session
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-4 text-center text-sm text-[#8a90a3]">
              No active sessions.
            </p>
          )}
        </div>
      </SettingsCard>
    </div>
  );
}

function ProfileField({
  label,
  value
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 shrink-0 text-[#8a90a3]">{label}</span>
      <span className="min-w-0 font-semibold text-[#11142c]">{value}</span>
    </div>
  );
}
