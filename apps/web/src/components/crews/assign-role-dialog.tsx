"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DEPARTMENT_ORDER } from "@/components/crews/crew-data";
import {
  PERMISSIONS,
  PERMISSION_LABELS,
  PERMISSION_PRESETS,
  POSITION_SUGGESTIONS
} from "@/lib/permissions";
import { assignRole } from "@/services/base-workspace.service";
import type { PendingMember } from "@/types/base";

type Step = "position" | "team" | "permissions";

export function AssignRoleDialog({
  houseId,
  member,
  onOpenChange,
  onAssigned
}: {
  houseId: string;
  member: PendingMember;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
}) {
  const [step, setStep] = useState<Step>("position");
  const [position, setPosition] = useState(POSITION_SUGGESTIONS[0]);
  const [customPosition, setCustomPosition] = useState("");
  const [team, setTeam] = useState<string>(DEPARTMENT_ORDER[0]);
  const [customTeam, setCustomTeam] = useState("");
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const roleName = position === "Custom" ? customPosition.trim() : position;
  const teamName = team === "Custom" ? customTeam.trim() : team;

  function togglePermission(permission: string) {
    setPermissions((current) => {
      const next = new Set(current);
      if (next.has(permission)) {
        next.delete(permission);
      } else {
        next.add(permission);
      }
      return next;
    });
  }

  function applyPreset(preset: string) {
    setPermissions(new Set(PERMISSION_PRESETS[preset] ?? []));
  }

  async function handleSubmit() {
    if (!roleName) {
      setError("Enter a position name.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await assignRole(houseId, member.membershipId, {
        roleName,
        team: teamName,
        permissions: Array.from(permissions)
      });
      onAssigned();
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not assign this role."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign role to {member.name}</DialogTitle>
        </DialogHeader>

        {step === "position" ? (
          <div className="grid gap-4">
            <Label>Position</Label>
            <Select
              onValueChange={(next) => setPosition(next ?? position)}
              value={position}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POSITION_SUGGESTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {position === "Custom" ? (
              <Input
                autoFocus
                onChange={(event) => setCustomPosition(event.target.value)}
                placeholder="Position name"
                value={customPosition}
              />
            ) : null}
          </div>
        ) : null}

        {step === "team" ? (
          <div className="grid gap-4">
            <Label>Team</Label>
            <Select
              onValueChange={(next) => setTeam(next ?? team)}
              value={team}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENT_ORDER.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {team === "Custom" ? (
              <Input
                autoFocus
                onChange={(event) => setCustomTeam(event.target.value)}
                placeholder="Team name"
                value={customTeam}
              />
            ) : null}
          </div>
        ) : null}

        {step === "permissions" ? (
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(PERMISSION_PRESETS).map((preset) => (
                <button
                  className="rounded-full bg-[var(--fylmico-accent)]/10 px-2.5 py-1 text-xs font-bold text-[var(--fylmico-accent)] hover:bg-[var(--fylmico-accent)]/20"
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  type="button"
                >
                  {preset} preset
                </button>
              ))}
            </div>
            <div className="grid max-h-72 grid-cols-1 gap-x-4 gap-y-2 overflow-y-auto sm:grid-cols-2">
              {PERMISSIONS.map((permission) => (
                <label
                  className="flex items-center gap-2 text-sm text-[#3a3f57] dark:text-[#b4b8cc]"
                  key={permission}
                >
                  <Checkbox
                    checked={permissions.has(permission)}
                    onCheckedChange={() => togglePermission(permission)}
                  />
                  {PERMISSION_LABELS[permission]}
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="animate-in fade-in slide-in-from-top-1 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-600 duration-200">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          {step !== "position" ? (
            <Button
              onClick={() =>
                setStep(step === "permissions" ? "team" : "position")
              }
              type="button"
              variant="outline"
            >
              Back
            </Button>
          ) : (
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          )}
          {step !== "permissions" ? (
            <Button
              disabled={step === "position" && !roleName}
              onClick={() =>
                setStep(step === "position" ? "team" : "permissions")
              }
              type="button"
            >
              Next
            </Button>
          ) : (
            <Button disabled={saving} onClick={handleSubmit} type="button">
              {saving ? "Saving..." : "Save"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
