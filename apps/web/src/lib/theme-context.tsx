"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

// The resolved, in-effect theme that components actually render against.
export type Theme = "light" | "dark";
// What the user picked. "system" tracks the device and is the default.
export type ThemePreference = "system" | "light" | "dark";
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

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(preference: ThemePreference): Theme {
  return preference === "system" ? systemTheme() : preference;
}

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

function readStoredPreference(): ThemePreference {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
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
  preference: ThemePreference;
  accent: AccentColor;
  density: Density;
  setPreference: (preference: ThemePreference) => void;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: AccentColor) => void;
  setDensity: (density: Density) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [theme, setThemeState] = useState<Theme>("light");
  const [accent, setAccentState] = useState<AccentColor>("violet");
  const [density, setDensityState] = useState<Density>("default");

  useEffect(() => {
    const storedPreference = readStoredPreference();
    const resolved = resolveTheme(storedPreference);
    // Deliberate mount-time sync: localStorage/matchMedia only exist in the
    // browser, so React state can't know the real theme until after
    // hydration. The blocking <script> in layout.tsx already set the DOM
    // class before paint; this just brings React state in line with it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreferenceState(storedPreference);
    setThemeState(resolved);
    applyTheme(resolved);
    const storedAccent = readStoredAccent();
    const storedDensity = readStoredDensity();
    setAccentState(storedAccent);
    setDensityState(storedDensity);
    applyAccent(storedAccent);
    applyDensity(storedDensity);
  }, []);

  // While the preference is "system", follow the OS live so the app flips
  // the moment the device switches between light and dark.
  useEffect(() => {
    if (preference !== "system") {
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const resolved = systemTheme();
      runThemeTransition();
      setThemeState(resolved);
      applyTheme(resolved);
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    const resolved = resolveTheme(next);
    runThemeTransition();
    setPreferenceState(next);
    setThemeState(resolved);
    applyTheme(resolved);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const setTheme = useCallback(
    (next: Theme) => setPreference(next),
    [setPreference]
  );

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
    // The quick topbar toggle commits to an explicit choice (leaving
    // "system"); the full System/Light/Dark control lives in Appearance.
    setPreference(theme === "dark" ? "light" : "dark");
  }, [theme, setPreference]);

  return (
    <ThemeContext.Provider
      value={{
        accent,
        density,
        preference,
        setAccent,
        setDensity,
        setPreference,
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
