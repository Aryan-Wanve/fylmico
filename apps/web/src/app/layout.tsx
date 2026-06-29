import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Fylmico",
    template: "%s | Fylmico"
  },
  description: "The operating system for creative production."
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0b0d10"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
