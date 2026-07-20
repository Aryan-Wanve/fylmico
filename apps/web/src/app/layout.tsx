import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/lib/theme-context";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Fylmico",
    template: "%s | Fylmico"
  },
  description: "The operating system for creative production."
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0f18" }
  ]
};

const THEME_INIT_SCRIPT = `
try {
  var stored = window.localStorage.getItem("fylmico-theme");
  var isDark = stored === "dark" || (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
  var accent = window.localStorage.getItem("fylmico-accent");
  var accentValues = { blue: "#2563eb", emerald: "#059669", rose: "#e11d48", violet: "#654cff" };
  document.documentElement.style.setProperty("--fylmico-accent", accentValues[accent] || accentValues.violet);
  var density = window.localStorage.getItem("fylmico-density");
  if (density === "compact" || density === "comfortable") {
    document.documentElement.dataset.density = density;
  }
} catch (error) {}
`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={cn("font-sans", geist.variable)}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
