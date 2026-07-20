import { Clock } from "lucide-react";

export function ComingSoonNotice({ description }: { description: string }) {
  return (
    <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-black/10 bg-black/[0.015] px-6 py-10 text-center dark:border-white/10 dark:bg-white/[0.03]">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--fylmico-accent)]/10 text-[var(--fylmico-accent)]">
        <Clock className="h-5 w-5" />
      </span>
      <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
        Coming soon
      </strong>
      <p className="max-w-sm text-sm text-[#667085] dark:text-[#878ca0]">
        {description}
      </p>
    </div>
  );
}
