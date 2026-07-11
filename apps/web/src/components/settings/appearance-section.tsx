import { SettingsCard } from "@/components/settings/settings-card";
import { ComingSoonNotice } from "@/components/settings/coming-soon-notice";

export function AppearanceSection() {
  return (
    <div className="grid gap-6">
      <SettingsCard
        subtitle="Choose how Fylmico looks on your device."
        title="Theme"
      >
        <ComingSoonNotice description="Theme preferences aren't saved yet." />
      </SettingsCard>

      <SettingsCard
        subtitle="Pick the accent color used across buttons and highlights."
        title="Accent Color"
      >
        <ComingSoonNotice description="Accent color customization isn't available yet." />
      </SettingsCard>

      <SettingsCard
        subtitle="Adjust spacing across tables and lists."
        title="Density"
      >
        <ComingSoonNotice description="Layout density preferences aren't saved yet." />
      </SettingsCard>
    </div>
  );
}
