export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] px-6 py-8 text-[var(--color-foreground)]">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-between">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <p className="text-sm font-medium tracking-[0.2em] text-white/60 uppercase">
            Fylmico
          </p>
          <p className="text-sm text-white/50">Sprint 0 Foundation</p>
        </header>

        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-medium tracking-[0.2em] text-white/50 uppercase">
            The Operating System for Creative Production
          </p>
          <h1 className="text-4xl leading-tight font-semibold text-balance sm:text-6xl">
            Engineering foundation ready for the first product sprint.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/64">
            This Next.js shell exists only to verify the production runtime,
            styling pipeline, TypeScript, linting, and deployment path.
          </p>
        </div>

        <footer className="border-t border-white/10 pt-5 text-sm text-white/45">
          No product features, authentication, database models, APIs, or
          business logic have been implemented.
        </footer>
      </section>
    </main>
  );
}
