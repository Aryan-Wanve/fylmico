"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={
        compact
          ? "grid h-9 w-9 place-items-center rounded-full text-[#4b5268] hover:bg-black/[0.04] dark:text-[#c7cad9] dark:hover:bg-white/[0.06]"
          : "flex h-10 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-bold text-[#12142b] hover:bg-black/[0.03] dark:border-white/10 dark:bg-[#171a28] dark:text-[#f1f2f8] dark:hover:bg-white/[0.06]"
      }
      onClick={toggleTheme}
      type="button"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {compact ? null : isDark ? "Light mode" : "Dark mode"}
    </button>
  );
}
