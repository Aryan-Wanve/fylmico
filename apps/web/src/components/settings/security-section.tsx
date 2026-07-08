"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SettingsCard } from "@/components/settings/settings-card";

const SECURITY_LOG = [
  { id: "log-1", text: "Password changed", time: "3 weeks ago" },
  { id: "log-2", text: "New sign-in from Chrome on Windows", time: "Today, 8:02 AM" },
  { id: "log-3", text: "Two-factor authentication enabled", time: "1 month ago" }
];

export function SecuritySection() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  return (
    <div className="grid gap-6">
      <SettingsCard
        subtitle="Add an extra layer of protection to your account."
        title="Two-Factor Authentication"
      >
        <div className="flex items-center justify-between rounded-xl border border-black/[0.06] px-3.5 py-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-4.5 w-4.5" />
            </span>
            <div>
              <strong className="block text-sm font-semibold text-[#11142c]">
                Authenticator app
              </strong>
              <span className="text-xs text-[#8a90a3]">
                {twoFactorEnabled ? "Enabled" : "Disabled"} for your account
              </span>
            </div>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={() => setTwoFactorEnabled((value) => !value)}
          />
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl border border-black/[0.06] px-3.5 py-3">
          <div>
            <strong className="block text-sm font-semibold text-[#11142c]">
              Login alerts
            </strong>
            <span className="text-xs text-[#8a90a3]">
              Email me when a new device signs in.
            </span>
          </div>
          <Switch
            checked={loginAlerts}
            onCheckedChange={() => setLoginAlerts((value) => !value)}
          />
        </div>
      </SettingsCard>

      <SettingsCard
        subtitle="Recent security-related activity on your account."
        title="Security Log"
      >
        <div className="grid gap-2">
          {SECURITY_LOG.map((entry) => (
            <div
              className="flex items-center justify-between rounded-xl border border-black/[0.06] px-3.5 py-2.5"
              key={entry.id}
            >
              <span className="text-sm text-[#3a3f57]">{entry.text}</span>
              <span className="text-xs text-[#8a90a3]">{entry.time}</span>
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}
