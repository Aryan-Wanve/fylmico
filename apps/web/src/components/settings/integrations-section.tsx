"use client";

import { useState } from "react";
import { Plug } from "lucide-react";
import { SettingsCard } from "@/components/settings/settings-card";
import { integrations as defaultIntegrations } from "@/components/settings/settings-data";

export function IntegrationsSection() {
  const [integrations, setIntegrations] = useState(defaultIntegrations);

  function toggleConnection(id: string) {
    setIntegrations((current) =>
      current.map((integration) =>
        integration.id === id
          ? { ...integration, connected: !integration.connected }
          : integration
      )
    );
  }

  return (
    <SettingsCard
      subtitle="Connect the tools your team already uses."
      title="Integrations"
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {integrations.map((integration) => (
          <div
            className="flex items-center gap-3 rounded-xl border border-black/[0.06] px-3.5 py-3"
            key={integration.id}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#654cff]/10 text-[#654cff]">
              <Plug className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block text-sm font-bold text-[#11142c]">
                {integration.name}
              </strong>
              <span className="text-xs text-[#8a90a3]">
                {integration.description}
              </span>
            </div>
            <button
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${
                integration.connected
                  ? "bg-black/[0.04] text-[#4b5268] hover:bg-black/[0.08]"
                  : "bg-[#654cff] text-white hover:bg-[#5a41ea]"
              }`}
              onClick={() => toggleConnection(integration.id)}
              type="button"
            >
              {integration.connected ? "Disconnect" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
