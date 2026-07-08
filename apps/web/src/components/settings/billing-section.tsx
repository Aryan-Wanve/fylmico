import { CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SettingsCard } from "@/components/settings/settings-card";
import { billingHistory, workspacePlan } from "@/components/settings/settings-data";

export function BillingSection() {
  return (
    <div className="grid gap-6">
      <SettingsCard
        subtitle="Your current subscription and payment method."
        title="Billing"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-black/[0.06] px-4 py-3.5">
          <div>
            <strong className="text-sm font-bold text-[#11142c]">
              {workspacePlan.name}
            </strong>
            <p className="text-xs text-[#8a90a3]">$29.00 / month &bull; renews Aug 1, 2026</p>
          </div>
          <button
            className="rounded-lg border border-black/10 px-3.5 py-1.5 text-xs font-bold text-[#4b5268] hover:bg-black/[0.03]"
            type="button"
          >
            Change Plan
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-black/[0.06] px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-black/[0.04] text-[#4b5268]">
              <CreditCard className="h-4.5 w-4.5" />
            </span>
            <div>
              <strong className="block text-sm font-semibold text-[#11142c]">
                Visa ending in 4242
              </strong>
              <span className="text-xs text-[#8a90a3]">Expires 08/28</span>
            </div>
          </div>
          <button
            className="rounded-lg border border-black/10 px-3.5 py-1.5 text-xs font-bold text-[#4b5268] hover:bg-black/[0.03]"
            type="button"
          >
            Update
          </button>
        </div>
      </SettingsCard>

      <SettingsCard subtitle="Your last three invoices." title="Billing History">
        <div className="grid gap-2">
          {billingHistory.map((invoice) => (
            <div
              className="flex items-center justify-between rounded-xl border border-black/[0.06] px-3.5 py-2.5"
              key={invoice.id}
            >
              <span className="text-sm font-semibold text-[#11142c]">
                {invoice.date}
              </span>
              <span className="text-sm text-[#5f667d]">{invoice.amount}</span>
              <Badge className="bg-emerald-100 text-emerald-700">
                {invoice.status}
              </Badge>
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}
