"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SettingsCard } from "@/components/settings/settings-card";
import { workspaceInfo } from "@/components/settings/settings-data";

export function WorkspaceSection() {
  const [form, setForm] = useState(workspaceInfo);
  const [saved, setSaved] = useState(false);

  return (
    <SettingsCard
      subtitle="Update the details every member of this house sees."
      title="Workspace"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <Label className="text-sm font-semibold text-[#3a3f57]">
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
          <Label className="text-sm font-semibold text-[#3a3f57]">Handle</Label>
          <Input
            onChange={(event) => {
              setForm({ ...form, handle: event.target.value });
              setSaved(false);
            }}
            value={form.handle}
          />
        </label>
        <label className="grid gap-1.5 sm:col-span-2">
          <Label className="text-sm font-semibold text-[#3a3f57]">
            Description
          </Label>
          <textarea
            className="min-h-[4.5rem] rounded-lg border border-black/10 p-2.5 text-sm text-[#11142c] outline-none"
            onChange={(event) => {
              setForm({ ...form, description: event.target.value });
              setSaved(false);
            }}
            value={form.description}
          />
        </label>
        <label className="grid gap-1.5">
          <Label className="text-sm font-semibold text-[#3a3f57]">
            Timezone
          </Label>
          <Input
            onChange={(event) => {
              setForm({ ...form, timezone: event.target.value });
              setSaved(false);
            }}
            value={form.timezone}
          />
        </label>
        <label className="grid gap-1.5">
          <Label className="text-sm font-semibold text-[#3a3f57]">
            Date Format
          </Label>
          <select
            className="h-9 rounded-lg border border-black/10 px-2.5 text-sm text-[#11142c] outline-none"
            onChange={(event) => {
              setForm({ ...form, dateFormat: event.target.value });
              setSaved(false);
            }}
            value={form.dateFormat}
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </label>
      </div>

      {saved ? (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-700">
          Workspace settings saved.
        </p>
      ) : null}

      <Button className="mt-4" onClick={() => setSaved(true)}>
        Save Changes
      </Button>
    </SettingsCard>
  );
}
