import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/lib/theme-context";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://lightcyan-lion-635016.hostingersite.com";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Fylmico",
      url: siteUrl,
      description:
        "Fylmico makes project and production management software for creative teams."
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "Fylmico",
      url: siteUrl,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Project and production management for filmmakers, production houses, and content teams, including project planning, crew coordination, tasks, files, storyboards, and team communication.",
      publisher: { "@id": `${siteUrl}/#organization` }
    }
  ]
};

export const metadata: Metadata = {
  title: {
    default: "Fylmico | Creative Production Management",
    template: "%s | Fylmico"
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      "https://lightcyan-lion-635016.hostingersite.com"
  ),
  description:
    "Fylmico brings film and content production teams together to plan projects, coordinate crews, manage tasks and files, storyboard ideas, and deliver creative work.",
  applicationName: "Fylmico",
  category: "Business software",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Fylmico",
    title: "Fylmico | Creative Production Management",
    description:
      "Plan projects, coordinate crews, manage production tasks and files, and deliver creative work together with Fylmico.",
    url: "/",
    locale: "en_US"
  },
  twitter: {
    card: "summary",
    title: "Fylmico | Creative Production Management",
    description:
      "Project and production management for filmmakers, production houses, and content teams."
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  appleWebApp: {
    capable: true,
    title: "Fylmico",
    statusBarStyle: "black-translucent"
  }
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
