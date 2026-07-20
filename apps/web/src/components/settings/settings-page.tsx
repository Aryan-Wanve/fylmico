"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SettingsNav } from "@/components/settings/settings-nav";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { WorkspaceSection } from "@/components/settings/workspace-section";
import { MembersSection } from "@/components/settings/members-section";
import { NotificationsSection } from "@/components/settings/notifications-section";
import { AppearanceSection } from "@/components/settings/appearance-section";
import { IntegrationsSection } from "@/components/settings/integrations-section";
import { SecuritySection } from "@/components/settings/security-section";
import { BillingSection } from "@/components/settings/billing-section";
import { AdvancedSection } from "@/components/settings/advanced-section";
import type { SettingsSectionId } from "@/components/settings/settings-data";

const SECTION_CONTENT: Record<SettingsSectionId, React.ComponentType> = {
  workspace: WorkspaceSection,
  members: MembersSection,
  notifications: NotificationsSection,
  appearance: AppearanceSection,
  integrations: IntegrationsSection,
  security: SecuritySection,
  billing: BillingSection,
  advanced: AdvancedSection
};

function isSettingsSectionId(value: string | null): value is SettingsSectionId {
  return Boolean(value) && value! in SECTION_CONTENT;
}

export function SettingsPage() {
  const searchParams = useSearchParams();
  const requestedSection = searchParams.get("section");
  const [activeSection, setActiveSection] = useState<SettingsSectionId>(
    isSettingsSectionId(requestedSection) ? requestedSection : "workspace"
  );

  const ActiveSection = SECTION_CONTENT[activeSection];

  function handleDeleteAccount() {
    window.confirm(
      "This would permanently delete your account. This is a preview — nothing will actually be deleted."
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-black text-[#11142c] dark:text-[#f1f2f8]">
          Settings
        </h1>
        <p className="mt-1 text-[#5f667d] dark:text-[#a8acbf]">
          Manage your account, preferences and workspace settings.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[16rem_1fr_20rem]">
        <SettingsNav
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />
        <div className="min-w-0">
          <ActiveSection />
        </div>
        <SettingsSidebar onDeleteAccount={handleDeleteAccount} />
      </div>

      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4 text-xs text-[#8a90a3] dark:border-white/[0.06] dark:text-[#7d8299]">
        <span>&copy; 2026 Fylmico. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <button
            className="font-semibold hover:text-[#4b5268] dark:hover:text-[#c7cad9]"
            type="button"
          >
            Privacy Policy
          </button>
          <button
            className="font-semibold hover:text-[#4b5268] dark:hover:text-[#c7cad9]"
            type="button"
          >
            Terms of Service
          </button>
          <button
            className="font-semibold hover:text-[#4b5268] dark:hover:text-[#c7cad9]"
            type="button"
          >
            Support
          </button>
        </div>
      </div>
    </div>
  );
}
