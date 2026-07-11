export function HousesGuideSection({
  eyebrow,
  title,
  subtitle,
  children
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <span className="text-xs font-bold tracking-wide text-[#654cff] uppercase">
          {eyebrow}
        </span>
        <h2 className="mt-2 text-2xl font-black text-[#11142c] sm:text-3xl dark:text-[#f1f2f8]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-[#5f667d] dark:text-[#a8acbf]">
            {subtitle}
          </p>
        ) : null}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
