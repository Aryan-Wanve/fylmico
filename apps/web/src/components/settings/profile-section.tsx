"use client";

import { useState } from "react";
import Image from "next/image";
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
import { SettingsCard } from "@/components/settings/settings-card";
import {
  profile as defaultProfile,
  sessions as defaultSessions
} from "@/components/settings/settings-data";

export function ProfileSection() {
  const [profile, setProfile] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(defaultProfile);
  const [sessions, setSessions] = useState(defaultSessions);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function startEditing() {
    setDraft(profile);
    setIsEditing(true);
  }

  function saveProfile() {
    setProfile(draft);
    setIsEditing(false);
  }

  function handleUpdatePassword() {
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Fill in all three fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswordError("");
    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  function handleRevoke(sessionId: string) {
    setSessions((current) =>
      current.filter((session) => session.id !== sessionId)
    );
  }

  return (
    <div className="grid gap-6">
      <SettingsCard
        action={
          isEditing ? (
            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={saveProfile}>Save</Button>
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
            <div className="relative h-20 w-20 overflow-hidden rounded-full">
              <Image
                alt=""
                className="object-cover"
                fill
                sizes="5rem"
                src={profile.avatar}
              />
            </div>
            <button
              aria-label="Change profile photo"
              className="absolute right-0 bottom-0 grid h-7 w-7 place-items-center rounded-full bg-[#654cff] text-white ring-2 ring-white"
              type="button"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          {isEditing ? (
            <div className="grid min-w-[16rem] flex-1 gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <Label className="text-xs font-bold text-[#8a90a3] uppercase">
                  Full Name
                </Label>
                <Input
                  onChange={(event) =>
                    setDraft({ ...draft, fullName: event.target.value })
                  }
                  value={draft.fullName}
                />
              </label>
              <label className="grid gap-1.5">
                <Label className="text-xs font-bold text-[#8a90a3] uppercase">
                  Email
                </Label>
                <Input
                  onChange={(event) =>
                    setDraft({ ...draft, email: event.target.value })
                  }
                  value={draft.email}
                />
              </label>
              <label className="grid gap-1.5">
                <Label className="text-xs font-bold text-[#8a90a3] uppercase">
                  Role
                </Label>
                <Input
                  onChange={(event) =>
                    setDraft({ ...draft, role: event.target.value })
                  }
                  value={draft.role}
                />
              </label>
              <label className="grid gap-1.5">
                <Label className="text-xs font-bold text-[#8a90a3] uppercase">
                  Phone
                </Label>
                <Input
                  onChange={(event) =>
                    setDraft({ ...draft, phone: event.target.value })
                  }
                  value={draft.phone}
                />
              </label>
              <label className="grid gap-1.5">
                <Label className="text-xs font-bold text-[#8a90a3] uppercase">
                  Timezone
                </Label>
                <Input
                  onChange={(event) =>
                    setDraft({ ...draft, timezone: event.target.value })
                  }
                  value={draft.timezone}
                />
              </label>
            </div>
          ) : (
            <div className="grid flex-1 gap-2.5">
              <ProfileField label="Full Name" value={profile.fullName} />
              <ProfileField
                label="Email"
                value={
                  <span className="flex flex-wrap items-center gap-2">
                    {profile.email}
                    {profile.verified ? (
                      <Badge className="bg-emerald-100 text-emerald-700">
                        Verified
                      </Badge>
                    ) : null}
                  </span>
                }
              />
              <ProfileField label="Role" value={profile.role} />
              <ProfileField label="Phone" value={profile.phone} />
              <ProfileField label="Timezone" value={profile.timezone} />
              <ProfileField label="Joined" value={profile.joined} />
            </div>
          )}
        </div>
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

        <Button className="mt-4" onClick={handleUpdatePassword}>
          Update Password
        </Button>
      </SettingsCard>

      <SettingsCard
        subtitle="Manage your active sessions across devices."
        title="Account Sessions"
      >
        <div className="grid gap-2">
          {sessions.map((session) => {
            const DeviceIcon = session.device.startsWith("iPhone")
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
                      <strong className="text-sm font-semibold text-[#11142c]">
                        {session.device}
                      </strong>
                      {session.current ? (
                        <Badge className="bg-emerald-100 text-emerald-700">
                          Current Session
                        </Badge>
                      ) : null}
                    </span>
                    <span className="text-xs text-[#8a90a3]">
                      {session.location} &bull; IP {session.ip}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`text-xs font-semibold ${session.current ? "text-emerald-600" : "text-[#8a90a3]"}`}
                  >
                    {session.lastActive}
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
          })}
        </div>
        <button
          className="mt-3 w-full text-center text-sm font-bold text-[#654cff]"
          type="button"
        >
          View all sessions
        </button>
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
