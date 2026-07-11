"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SettingsCard } from "@/components/settings/settings-card";
import { useWorkspace } from "@/lib/workspace-context";
import { updateHouse } from "@/services/base-workspace.service";

export function WorkspaceSection() {
  const { activeHouse, refreshWorkspace } = useWorkspace();
  const [form, setForm] = useState({
    name: activeHouse?.name ?? "",
    handle: activeHouse?.handle ?? "",
    description: activeHouse?.description ?? ""
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
    <SettingsCard
      subtitle="Update the details every member of this house sees."
      title="Workspace"
    >
      <div className="grid gap-4 sm:grid-cols-2">
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
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-600">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-700">
          Workspace settings saved.
        </p>
      ) : null}

      <Button className="mt-4" disabled={saving} onClick={handleSave}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </SettingsCard>
  );
}
