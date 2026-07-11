"use client";

import { useState } from "react";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { SettingsCard } from "@/components/settings/settings-card";

const THEMES = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Laptop }
] as const;

const ACCENT_COLORS = [
  "#654cff",
  "#3b82f6",
  "#16c784",
  "#f59e0b",
  "#ec4899",
  "#64748b"
];

export function AppearanceSection() {
  const [theme, setTheme] = useState<(typeof THEMES)[number]["id"]>("light");
  const [accent, setAccent] = useState(ACCENT_COLORS[0]);
  const [density, setDensity] = useState<"comfortable" | "compact">(
    "comfortable"
  );

  return (
    <div className="grid gap-6">
      <SettingsCard
        subtitle="Choose how Fylmico looks on your device."
        title="Theme"
      >
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((option) => {
            const Icon = option.icon;
            const active = theme === option.id;

            return (
              <button
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-semibold ${
                  active
                    ? "border-[#654cff] bg-[#654cff]/[0.06] text-[#654cff]"
                    : "border-black/10 text-[#4b5268] hover:bg-black/[0.02]"
                }`}
                key={option.id}
                onClick={() => setTheme(option.id)}
                type="button"
              >
                <Icon className="h-5 w-5" />
                {option.label}
              </button>
            );
          })}
        </div>
      </SettingsCard>

      <SettingsCard
        subtitle="Pick the accent color used across buttons and highlights."
        title="Accent Color"
      >
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map((color) => (
            <button
              aria-label={`Use ${color} accent`}
              className={`grid h-9 w-9 place-items-center rounded-full ring-offset-2 ${
                accent === color ? "ring-2" : ""
              }`}
              key={color}
              onClick={() => setAccent(color)}
              style={
                {
                  backgroundColor: color,
                  "--tw-ring-color": color
                } as React.CSSProperties
              }
              type="button"
            >
              {accent === color ? (
                <Check className="h-4 w-4 text-white" />
              ) : null}
            </button>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard
        subtitle="Adjust spacing across tables and lists."
        title="Density"
      >
        <div className="flex items-center gap-1 rounded-lg bg-black/[0.04] p-1">
          <button
            className={`flex-1 rounded-md py-2 text-sm font-semibold ${
              density === "comfortable"
                ? "bg-white text-[#11142c] shadow-sm"
                : "text-[#8a90a3]"
            }`}
            onClick={() => setDensity("comfortable")}
            type="button"
          >
            Comfortable
          </button>
          <button
            className={`flex-1 rounded-md py-2 text-sm font-semibold ${
              density === "compact"
                ? "bg-white text-[#11142c] shadow-sm"
                : "text-[#8a90a3]"
            }`}
            onClick={() => setDensity("compact")}
            type="button"
          >
            Compact
          </button>
        </div>
      </SettingsCard>
    </div>
  );
}
