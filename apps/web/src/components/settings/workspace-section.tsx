"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsCard } from "@/components/settings/settings-card";
import { navItems } from "@/components/layout/nav-items";
import { ALWAYS_ENABLED_MODULES } from "@/lib/house-types";
import { useWorkspace } from "@/lib/workspace-context";
import { updateHouse } from "@/services/base-workspace.service";

const TOGGLEABLE_MODULES = navItems.filter(
  (item) => !ALWAYS_ENABLED_MODULES.includes(item.id)
);

export function WorkspaceSection() {
  const { workspace, activeHouse, refreshWorkspace } = useWorkspace();
  const isOwner =
    activeHouse?.members.find((member) => member.id === workspace.user.id)
      ?.role === "Owner";
  const [form, setForm] = useState({
    name: activeHouse?.name ?? "",
    handle: activeHouse?.handle ?? "",
    description: activeHouse?.description ?? ""
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  // Optimistic module state: the switch flips instantly on click and only
  // reverts if the save actually fails, instead of waiting for the round-trip
  // + full workspace refetch to complete (which is what caused the lag).
  const [optimisticModules, setOptimisticModules] = useState<string[] | null>(
    null
  );

  const enabledModules = optimisticModules ?? activeHouse?.enabledModules ?? [];

  async function toggleModule(moduleId: string) {
    if (!activeHouse) {
      return;
    }
    const previous = enabledModules;
    const next = previous.includes(moduleId)
      ? previous.filter((id) => id !== moduleId)
      : [...previous, moduleId];

    setOptimisticModules(next);
    try {
      await updateHouse({ enabledModules: next });
      await refreshWorkspace();
    } catch (moduleError) {
      setOptimisticModules(previous);
      window.alert(
        moduleError instanceof Error
          ? moduleError.message
          : "Could not update enabled modules."
      );
    }
  }

  async function handleSave() {
    setError("");
    setSaved(false);
    setSaving(true);

    try {
      await updateHouse(form);
      await refreshWorkspace();
      setSaved(true);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not save workspace settings."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <SettingsCard
        subtitle="Update the details every member of this house sees."
        title="Workspace"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
              Workspace Name
            </Label>
            <Input
              onChange={(event) => {
                setForm({ ...form, name: event.target.value });
                setSaved(false);
              }}
              value={form.name}
            />
          </label>
          <label className="grid gap-1.5">
            <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
              Handle
            </Label>
            <Input
              onChange={(event) => {
                setForm({ ...form, handle: event.target.value });
                setSaved(false);
              }}
              value={form.handle}
            />
          </label>
          <label className="grid gap-1.5 sm:col-span-2">
            <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
              Description
            </Label>
            <textarea
              className="min-h-[4.5rem] rounded-lg border border-black/10 p-2.5 text-sm text-[#11142c] outline-none dark:border-white/10 dark:text-[#f1f2f8]"
              onChange={(event) => {
                setForm({ ...form, description: event.target.value });
                setSaved(false);
              }}
              value={form.description}
            />
          </label>
        </div>

        {error ? (
          <p className="animate-in fade-in slide-in-from-top-1 mt-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-600 duration-200">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="animate-in fade-in slide-in-from-top-1 mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-700 duration-200">
            Workspace settings saved.
          </p>
        ) : null}

        <Button className="mt-4" disabled={saving} onClick={handleSave}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </SettingsCard>

      {isOwner && activeHouse ? (
        <SettingsCard
          subtitle="Turn modules on or off for everyone in this house."
          title="Modules"
        >
          <div className="grid gap-1">
            {TOGGLEABLE_MODULES.map((item) => (
              <div
                className="flex items-center justify-between gap-4 rounded-xl px-1 py-3"
                key={item.id}
              >
                <span className="text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                  {item.label}
                </span>
                <Switch
                  checked={enabledModules.includes(item.id)}
                  onCheckedChange={() => toggleModule(item.id)}
                />
              </div>
            ))}
          </div>
        </SettingsCard>
      ) : null}
    </div>
  );
}
