"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

export type Theme = "light" | "dark";
export type AccentColor = "violet" | "blue" | "emerald" | "rose";
export type Density = "compact" | "default" | "comfortable";

const STORAGE_KEY = "fylmico-theme";
const ACCENT_STORAGE_KEY = "fylmico-accent";
const DENSITY_STORAGE_KEY = "fylmico-density";
const THEME_TRANSITION_MS = 360;

const ACCENT_VALUES: Record<AccentColor, string> = {
  violet: "#654cff",
  blue: "#2563eb",
  emerald: "#059669",
  rose: "#e11d48"
};

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function runThemeTransition() {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  window.setTimeout(() => {
    root.classList.remove("theme-transition");
  }, THEME_TRANSITION_MS);
}

function readStoredTheme(): Theme | null {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

function readStoredAccent(): AccentColor {
  const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY);
  return stored === "blue" || stored === "emerald" || stored === "rose"
    ? stored
    : "violet";
}

function applyAccent(accent: AccentColor) {
  document.documentElement.style.setProperty(
    "--fylmico-accent",
    ACCENT_VALUES[accent]
  );
}

function readStoredDensity(): Density {
  const stored = window.localStorage.getItem(DENSITY_STORAGE_KEY);
  return stored === "compact" || stored === "comfortable" ? stored : "default";
}

function applyDensity(density: Density) {
  if (density === "default") {
    document.documentElement.removeAttribute("data-density");
    return;
  }

  document.documentElement.dataset.density = density;
}

type ThemeContextValue = {
  theme: Theme;
  accent: AccentColor;
  density: Density;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: AccentColor) => void;
  setDensity: (density: Density) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [accent, setAccentState] = useState<AccentColor>("violet");
  const [density, setDensityState] = useState<Density>("default");

  useEffect(() => {
    const stored = readStoredTheme();
    const initial =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    // Deliberate mount-time sync: localStorage/matchMedia only exist in the
    // browser, so React state can't know the real theme until after
    // hydration. The blocking <script> in layout.tsx already set the DOM
    // class before paint; this just brings React state in line with it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initial);
    applyTheme(initial);
    const storedAccent = readStoredAccent();
    const storedDensity = readStoredDensity();
    setAccentState(storedAccent);
    setDensityState(storedDensity);
    applyAccent(storedAccent);
    applyDensity(storedDensity);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    runThemeTransition();
    setThemeState(next);
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const setAccent = useCallback((next: AccentColor) => {
    setAccentState(next);
    applyAccent(next);
    window.localStorage.setItem(ACCENT_STORAGE_KEY, next);
  }, []);

  const setDensity = useCallback((next: Density) => {
    setDensityState(next);
    applyDensity(next);
    window.localStorage.setItem(DENSITY_STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        accent,
        density,
        setAccent,
        setDensity,
        setTheme,
        theme,
        toggleTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
