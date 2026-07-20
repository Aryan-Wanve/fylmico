import type { LucideIcon } from "lucide-react";
import { Sparkline } from "@/components/dashboard/sparkline";

const TONE_STYLES: Record<"violet" | "blue" | "green" | "orange", string> = {
  violet: "bg-[var(--fylmico-accent)]/12 text-[var(--fylmico-accent)]",
  blue: "bg-[#3b82f6]/12 text-[#2563eb]",
  green: "bg-[#16c784]/12 text-[#0baa6d]",
  orange: "bg-[#f97316]/12 text-[#ea580c]"
};

export function StatCard({
  icon: Icon,
  title,
  value,
  note,
  noteTone = "default",
  tone,
  sparklinePoints,
  extra
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  note: string;
  noteTone?: "default" | "positive";
  tone: "violet" | "blue" | "green" | "orange";
  sparklinePoints?: number[];
  extra?: React.ReactNode;
}) {
  return (
    <article className="flex min-w-0 items-center gap-4 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <div
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${TONE_STYLES[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <strong className="block text-sm font-semibold text-[#5f667d] dark:text-[#a8acbf]">
          {title}
        </strong>
        <span className="mt-1 block text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
          {value}
        </span>
        <p
          className={`mt-1 text-xs font-semibold ${noteTone === "positive" ? "text-emerald-600" : "text-[#8a90a3] dark:text-[#7d8299]"}`}
        >
          {note}
        </p>
        {extra}
      </div>
      {sparklinePoints ? (
        <Sparkline points={sparklinePoints} tone={tone} />
      ) : null}
    </article>
  );
}
