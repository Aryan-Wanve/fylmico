import { AuthMarketingPanel } from "@/components/login/auth-marketing-panel";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative grid h-screen grid-cols-1 overflow-hidden md:grid-cols-2">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover"
        style={{
          backgroundImage: "url(/images/login-hero.png)",
          backgroundPosition: "50% 100%"
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #f6f5ff 0rem, #f6f5ff 30rem, rgba(246,245,255,0.85) 33rem, rgba(246,245,255,0.35) 36rem, rgba(246,245,255,0) 40rem)"
        }}
      />

      <AuthMarketingPanel />

      <section
        aria-label="Authentication"
        className="relative flex h-full flex-col items-center justify-center overflow-y-auto px-6 py-6 sm:px-10"
      >
        {children}
      </section>
    </main>
  );
}
