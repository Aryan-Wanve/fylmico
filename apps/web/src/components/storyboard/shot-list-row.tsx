import { Camera } from "lucide-react";
import type { Shot } from "@/types/base";

export function ShotListRow({
  shot,
  index,
  selected,
  onSelect,
  dense = false
}: {
  shot: Shot;
  index: number;
  selected: boolean;
  onSelect: () => void;
  dense?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-4 border-b border-black/5 text-left last:border-b-0 hover:bg-black/[0.015] dark:border-white/[0.06] dark:hover:bg-white/[0.03] ${
        dense ? "px-3 py-1.5" : "px-4 py-3"
      } ${selected ? "bg-[var(--fylmico-accent)]/[0.05]" : ""}`}
      onClick={onSelect}
      type="button"
    >
      <span
        className={`grid shrink-0 place-items-center rounded-lg bg-gradient-to-b from-[#f4f4f8] to-[#e7e7ee] dark:from-[#20232f] dark:to-[#262a3a] ${dense ? "h-8 w-11" : "h-12 w-16"}`}
      >
        <Camera className="h-5 w-5 text-[#8a90a3]/70" strokeWidth={1.25} />
      </span>
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-black/[0.06] text-xs font-bold text-[#4b5268] dark:bg-white/[0.08] dark:text-[#c7cad9]">
        {index + 1}
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          Shot {index + 1}
        </strong>
        <span className="block truncate text-xs text-[#8a90a3] dark:text-[#7d8299]">
          {shot.description}
        </span>
      </span>
      {shot.cameraAngle ? (
        <span className="shrink-0 rounded-md bg-[var(--fylmico-accent)]/85 px-2 py-0.5 text-xs font-bold text-white">
          {shot.cameraAngle}
        </span>
      ) : null}
    </button>
  );
}
