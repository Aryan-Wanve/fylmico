import { Moon, Sun } from "lucide-react";
import { SettingsCard } from "@/components/settings/settings-card";
import { ComingSoonNotice } from "@/components/settings/coming-soon-notice";
import { useTheme } from "@/lib/theme-context";
import type { Theme } from "@/lib/theme-context";

function ThemeOption({
  value,
  label,
  icon: Icon,
  active,
  onSelect
}: {
  value: Theme;
  label: string;
  icon: typeof Sun;
  active: boolean;
  onSelect: (value: Theme) => void;
}) {
  return (
    <button
      className={`flex flex-1 flex-col items-center gap-2 rounded-xl border p-4 text-sm font-semibold transition-colors ${
        active
          ? "border-[#654cff] bg-[#654cff]/[0.06] text-[#654cff]"
          : "border-black/10 text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.06]"
      }`}
      onClick={() => onSelect(value)}
      type="button"
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid gap-6">
      <SettingsCard
        subtitle="Choose how Fylmico looks on your device."
        title="Theme"
      >
        <div className="flex gap-3">
          <ThemeOption
            active={theme === "light"}
            icon={Sun}
            label="Light"
            onSelect={setTheme}
            value="light"
          />
          <ThemeOption
            active={theme === "dark"}
            icon={Moon}
            label="Dark"
            onSelect={setTheme}
            value="dark"
          />
        </div>
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
