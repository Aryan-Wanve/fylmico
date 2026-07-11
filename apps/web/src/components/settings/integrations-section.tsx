import { SettingsCard } from "@/components/settings/settings-card";
import { ComingSoonNotice } from "@/components/settings/coming-soon-notice";

export function IntegrationsSection() {
  return (
    <SettingsCard
      subtitle="Connect the tools your team already uses."
      title="Integrations"
    >
      <ComingSoonNotice description="Third-party integrations aren't available yet." />
    </SettingsCard>
  );
}
