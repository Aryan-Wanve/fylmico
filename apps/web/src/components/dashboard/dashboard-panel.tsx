export function DashboardPanel({
  title,
  action,
  children,
  className
}: {
  title: string;
  action?: { label: string; onClick?: () => void };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] ${className ?? ""}`}
    >
      <header className="flex h-16 items-center justify-between border-b border-black/5 px-6">
        <h2 className="text-base font-bold text-[#11142c]">{title}</h2>
        {action ? (
          <button
            className="text-sm font-bold text-[#654cff]"
            onClick={action.onClick}
            type="button"
          >
            {action.label}
          </button>
        ) : null}
      </header>
      {children}
    </section>
  );
}
