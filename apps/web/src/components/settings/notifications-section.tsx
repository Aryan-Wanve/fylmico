"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { SettingsCard } from "@/components/settings/settings-card";
import { notificationPreferences } from "@/components/settings/settings-data";

export function NotificationsSection() {
  const [preferences, setPreferences] = useState(notificationPreferences);

  function toggle(id: string, channel: "email" | "push") {
    setPreferences((current) =>
      current.map((preference) =>
        preference.id === id
          ? { ...preference, [channel]: !preference[channel] }
          : preference
      )
    );
  }

  return (
    <SettingsCard
      subtitle="Choose how you want to be notified about workspace activity."
      title="Notifications"
    >
      <div className="grid gap-1">
        <div className="grid grid-cols-[1fr_5rem_5rem] gap-4 px-1 pb-2 text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:text-[#7d8299]">
          <span>Preference</span>
          <span className="text-center">Email</span>
          <span className="text-center">Push</span>
        </div>
        {preferences.map((preference) => (
          <div
            className="grid grid-cols-[1fr_5rem_5rem] items-center gap-4 rounded-xl px-1 py-3"
            key={preference.id}
          >
            <div>
              <strong className="block text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                {preference.label}
              </strong>
              <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                {preference.description}
              </span>
            </div>
            <div className="flex justify-center">
              <Switch
                checked={preference.email}
                onCheckedChange={() => toggle(preference.id, "email")}
              />
            </div>
            <div className="flex justify-center">
              <Switch
                checked={preference.push}
                onCheckedChange={() => toggle(preference.id, "push")}
              />
            </div>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
