import { ArrowRight, type LucideIcon } from "lucide-react";

const ICON_TONE_CLASSES = {
  purple: "bg-gradient-to-br from-[#7257ff] to-[#563df0] text-white",
  pink: "bg-gradient-to-br from-[#ff5fa8] to-[#e0257a] text-white",
  blue: "bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white",
  soft: "bg-[var(--fylmico-accent)]/10 text-[var(--fylmico-accent)]"
} as const;

export function HouseChoiceRow({
  icon: Icon,
  title,
  description,
  tone = "purple",
  disabled,
  onClick
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: keyof typeof ICON_TONE_CLASSES;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="flex w-full items-center gap-4 rounded-2xl border border-black/10 bg-white p-4 text-left transition hover:-translate-y-px hover:border-[var(--fylmico-accent)]/25 hover:shadow-[0_1rem_2.6rem_rgba(53,45,124,0.08)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#171a28]"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${ICON_TONE_CLASSES[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1">
        <strong className="block text-[1.02rem] font-bold text-[#11142c] dark:text-[#f1f2f8]">
          {title}
        </strong>
        <span className="mt-0.5 block text-sm leading-snug text-[#5f667d] dark:text-[#a8acbf]">
          {description}
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-[#4b5268] dark:text-[#c7cad9]" />
    </button>
  );
}
