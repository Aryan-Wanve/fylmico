import { SettingsCard } from "@/components/settings/settings-card";
import { ComingSoonNotice } from "@/components/settings/coming-soon-notice";

export function SecuritySection() {
  return (
    <div className="grid gap-6">
      <SettingsCard
        subtitle="Add an extra layer of protection to your account."
        title="Two-Factor Authentication"
      >
        <ComingSoonNotice description="Two-factor authentication isn't available yet. We'll email you when it launches." />
      </SettingsCard>

      <SettingsCard
        subtitle="Recent security-related activity on your account."
        title="Security Log"
      >
        <ComingSoonNotice description="Sign-in and security activity history isn't available yet." />
      </SettingsCard>
    </div>
  );
}
