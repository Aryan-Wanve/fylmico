"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Laptop, MoreVertical, Smartphone } from "lucide-react";
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
import { AvatarCropDialog } from "@/components/settings/avatar-crop-dialog";
import { SettingsCard } from "@/components/settings/settings-card";
import { useWorkspace } from "@/lib/workspace-context";
import {
  changePassword,
  listSessions,
  revokeSession,
  updateMe,
  uploadAvatar
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

const BROWSER_PATTERNS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\//, "Opera"],
  [/Chrome\//, "Chrome"],
  [/CriOS\//, "Chrome"],
  [/FxiOS\//, "Firefox"],
  [/Firefox\//, "Firefox"],
  [/Version\/.+Safari/, "Safari"]
];

const OS_PATTERNS: [RegExp, string][] = [
  [/Windows/, "Windows"],
  [/Mac OS X/, "macOS"],
  [/iPhone|iPad|iOS/, "iOS"],
  [/Android/, "Android"],
  [/Linux/, "Linux"]
];

// Raw User-Agent strings are long and unreadable ("Mozilla/5.0 (Windows NT
// 10.0; ...) AppleWebKit/537.36 ..."). Reduce to "Browser on OS", falling
// back to "Unknown device" for anything that doesn't look like a real
// browser (e.g. a script or CLI request).
function formatUserAgent(userAgent: string | null | undefined): string {
  if (!userAgent) {
    return "Unknown device";
  }

  const browser = BROWSER_PATTERNS.find(([pattern]) =>
    pattern.test(userAgent)
  )?.[1];
  const os = OS_PATTERNS.find(([pattern]) => pattern.test(userAgent))?.[1];

  if (!browser && !os) {
    return "Unknown device";
  }

  if (browser && os) {
    return `${browser} on ${os}`;
  }

  return browser ?? os ?? "Unknown device";
}

export function ProfileSection() {
  const { workspace, refreshWorkspace } = useWorkspace();
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(workspace.user.name);
  const [draftUsername, setDraftUsername] = useState(
    workspace.user.username ?? ""
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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
    setDraftUsername(workspace.user.username ?? "");
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
      await updateMe({
        name: draftName.trim(),
        username: draftUsername.trim() || undefined
      });
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

  async function handleAvatarConfirmed(file: File) {
    setCropFile(null);
    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      await refreshWorkspace();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not upload avatar."
      );
    } finally {
      setUploadingAvatar(false);
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
          <div className="relative shrink-0">
            <AvatarWithStatus
              imageUrl={workspace.user.avatarUrl}
              label={workspace.user.avatarLabel}
              size="lg"
              userId={workspace.user.id}
            />
            <input
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setCropFile(file);
                }
                event.target.value = "";
              }}
              ref={avatarInputRef}
              type="file"
            />
            <button
              aria-label="Change avatar"
              className="absolute -right-1 -bottom-1 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[var(--fylmico-accent)] text-white hover:bg-[var(--fylmico-accent-strong)] disabled:opacity-60 dark:border-[#171a28]"
              disabled={uploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
              type="button"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <AvatarCropDialog
              file={cropFile}
              onCancel={() => setCropFile(null)}
              onConfirm={handleAvatarConfirmed}
              open={cropFile !== null}
            />
          </div>

          {isEditing ? (
            <div className="grid min-w-[16rem] flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <Label className="text-xs font-bold text-[#667085] uppercase dark:text-[#878ca0]">
                  Full Name
                </Label>
                <Input
                  onChange={(event) => setDraftName(event.target.value)}
                  value={draftName}
                />
              </label>
              <label className="grid gap-1.5">
                <Label className="text-xs font-bold text-[#667085] uppercase dark:text-[#878ca0]">
                  Username
                </Label>
                <Input
                  onChange={(event) =>
                    setDraftUsername(
                      event.target.value.toLowerCase().replace(/\s+/g, "_")
                    )
                  }
                  placeholder="e.g. qa_tester"
                  value={draftUsername}
                />
              </label>
            </div>
          ) : (
            <div className="grid flex-1 gap-2.5">
              <ProfileField label="Full Name" value={workspace.user.name} />
              <ProfileField
                label="Username"
                value={
                  workspace.user.username
                    ? `@${workspace.user.username}`
                    : "Not set"
                }
              />
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="grid gap-1.5">
            <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
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
            <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
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
            <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
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
                  className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-black/[0.06] px-3.5 py-3 dark:border-white/[0.08]"
                  key={session.id}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-black/[0.04] text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]">
                      <DeviceIcon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <span className="flex items-center gap-2">
                        <strong className="truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                          {formatUserAgent(session.userAgent)}
                        </strong>
                        {session.current ? (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            Current Session
                          </Badge>
                        ) : null}
                      </span>
                      <span className="text-xs text-[#667085] dark:text-[#878ca0]">
                        IP {session.ipAddress ?? "unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`text-xs font-semibold ${session.current ? "text-emerald-600" : "text-[#667085] dark:text-[#878ca0]"}`}
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
                            className="grid h-7 w-7 place-items-center rounded-full text-[#667085] hover:bg-black/[0.04] dark:text-[#878ca0] dark:hover:bg-white/[0.06]"
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
            <p className="py-4 text-center text-sm text-[#667085] dark:text-[#878ca0]">
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
      <span className="w-24 shrink-0 text-[#667085] dark:text-[#878ca0]">
        {label}
      </span>
      <span className="min-w-0 font-semibold text-[#11142c] dark:text-[#f1f2f8]">
        {value}
      </span>
    </div>
  );
}
