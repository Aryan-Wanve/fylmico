import { Check, Moon, Rows3, Sun } from "lucide-react";
import { SettingsCard } from "@/components/settings/settings-card";
import { useTheme } from "@/lib/theme-context";
import type { AccentColor, Density, Theme } from "@/lib/theme-context";

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
          ? "border-[var(--fylmico-accent)] bg-[var(--fylmico-accent)]/[0.06] text-[var(--fylmico-accent)]"
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

const ACCENT_OPTIONS: Array<{
  value: AccentColor;
  label: string;
  color: string;
}> = [
  { value: "violet", label: "Violet", color: "#654cff" },
  { value: "blue", label: "Blue", color: "#2563eb" },
  { value: "emerald", label: "Emerald", color: "#059669" },
  { value: "rose", label: "Rose", color: "#e11d48" }
];

const DENSITY_OPTIONS: Array<{
  value: Density;
  label: string;
  description: string;
}> = [
  {
    value: "compact",
    label: "Compact",
    description: "Tighter rows for production-heavy days."
  },
  {
    value: "default",
    label: "Default",
    description: "Balanced spacing across boards and lists."
  },
  {
    value: "comfortable",
    label: "Comfortable",
    description: "More breathing room on larger screens."
  }
];

export function AppearanceSection() {
  const { accent, density, setAccent, setDensity, setTheme, theme } =
    useTheme();

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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ACCENT_OPTIONS.map((option) => {
            const active = accent === option.value;

            return (
              <button
                aria-pressed={active}
                className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-4 text-sm font-bold transition-colors ${
                  active
                    ? "border-[var(--fylmico-accent)] bg-[var(--fylmico-accent)]/10 text-[var(--fylmico-accent)]"
                    : "border-black/10 text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.06]"
                }`}
                key={option.value}
                onClick={() => setAccent(option.value)}
                type="button"
              >
                <span
                  className="grid h-9 w-9 place-items-center rounded-full text-white shadow-sm"
                  style={{ backgroundColor: option.color }}
                >
                  {active ? <Check className="h-4 w-4" /> : null}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      </SettingsCard>

      <SettingsCard
        subtitle="Adjust spacing across tables and lists."
        title="Density"
      >
        <div className="grid gap-3">
          {DENSITY_OPTIONS.map((option) => {
            const active = density === option.value;

            return (
              <button
                aria-pressed={active}
                className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
                  active
                    ? "border-[var(--fylmico-accent)] bg-[var(--fylmico-accent)]/10"
                    : "border-black/10 hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.06]"
                }`}
                key={option.value}
                onClick={() => setDensity(option.value)}
                type="button"
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                    active
                      ? "bg-[var(--fylmico-accent)] text-white"
                      : "bg-black/[0.04] text-[#8a90a3] dark:bg-white/[0.06] dark:text-[#7d8299]"
                  }`}
                >
                  <Rows3 className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong
                    className={`block text-sm font-bold ${
                      active
                        ? "text-[var(--fylmico-accent)]"
                        : "text-[#11142c] dark:text-[#f1f2f8]"
                    }`}
                  >
                    {option.label}
                  </strong>
                  <span className="mt-0.5 block text-sm text-[#8a90a3] dark:text-[#7d8299]">
                    {option.description}
                  </span>
                </span>
                {active ? (
                  <Check className="h-4 w-4 shrink-0 text-[var(--fylmico-accent)]" />
                ) : null}
              </button>
            );
          })}
        </div>
      </SettingsCard>
    </div>
  );
}
