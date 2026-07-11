import { SettingsCard } from "@/components/settings/settings-card";
import { ComingSoonNotice } from "@/components/settings/coming-soon-notice";

export function BillingSection() {
  return (
    <div className="grid gap-6">
      <SettingsCard
        subtitle="Your current subscription and payment method."
        title="Billing"
      >
        <ComingSoonNotice description="Billing and payment management isn't available yet." />
      </SettingsCard>

      <SettingsCard
        subtitle="Your last three invoices."
        title="Billing History"
      >
        <ComingSoonNotice description="Invoice history isn't available yet." />
      </SettingsCard>
    </div>
  );
}
