import { SettingsCard } from "@/components/settings/settings-card";
import { ComingSoonNotice } from "@/components/settings/coming-soon-notice";

export function AdvancedSection() {
  return (
    <div className="grid gap-6">
      <SettingsCard
        subtitle="Use an API key to connect Fylmico to external tools."
        title="API Access"
      >
        <ComingSoonNotice description="API key issuance isn't available yet." />
      </SettingsCard>

      <SettingsCard
        subtitle="These actions are permanent and cannot be undone."
        title="Danger Zone"
      >
        <ComingSoonNotice description="Workspace reset isn't available yet." />
      </SettingsCard>
    </div>
  );
}
