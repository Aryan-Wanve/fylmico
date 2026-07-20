import {
  SETTINGS_SECTIONS,
  type SettingsSectionId
} from "@/components/settings/settings-data";

export function SettingsNav({
  activeSection,
  onSelectSection
}: {
  activeSection: SettingsSectionId;
  onSelectSection: (section: SettingsSectionId) => void;
}) {
  return (
    <nav className="grid content-start gap-1 rounded-2xl border border-black/[0.06] bg-white p-3 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      {SETTINGS_SECTIONS.map((section) => {
        const Icon = section.icon;
        const active = section.id === activeSection;

        return (
          <button
            className={`flex items-start gap-3 rounded-xl px-3 py-2.5 text-left ${
              active
                ? "bg-[var(--fylmico-accent)]/[0.08]"
                : "hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
            }`}
            key={section.id}
            onClick={() => onSelectSection(section.id)}
            type="button"
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                active
                  ? "bg-[var(--fylmico-accent)] text-white"
                  : "bg-black/[0.04] text-[#667085] dark:bg-white/[0.06] dark:text-[#878ca0]"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <strong
                className={`block text-sm font-bold ${active ? "text-[var(--fylmico-accent)]" : "text-[#11142c] dark:text-[#f1f2f8]"}`}
              >
                {section.label}
              </strong>
              <span className="text-xs text-[#667085] dark:text-[#878ca0]">
                {section.description}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
