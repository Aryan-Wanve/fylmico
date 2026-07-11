import { Camera } from "lucide-react";
import type { Shot } from "@/types/base";

export function ShotListRow({
  shot,
  index,
  selected,
  onSelect
}: {
  shot: Shot;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`flex w-full items-center gap-4 border-b border-black/5 px-4 py-3 text-left last:border-b-0 hover:bg-black/[0.015] ${
        selected ? "bg-[#654cff]/[0.05]" : ""
      }`}
      onClick={onSelect}
      type="button"
    >
      <span className="grid h-12 w-16 shrink-0 place-items-center rounded-lg bg-gradient-to-b from-[#f4f4f8] to-[#e7e7ee]">
        <Camera className="h-5 w-5 text-[#8a90a3]/70" strokeWidth={1.25} />
      </span>
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-black/[0.06] text-xs font-bold text-[#4b5268]">
        {index + 1}
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm font-bold text-[#11142c]">
          Shot {index + 1}
        </strong>
        <span className="block truncate text-xs text-[#8a90a3]">
          {shot.description}
        </span>
      </span>
      {shot.cameraAngle ? (
        <span className="shrink-0 rounded-md bg-[#654cff]/85 px-2 py-0.5 text-xs font-bold text-white">
          {shot.cameraAngle}
        </span>
      ) : null}
    </button>
  );
}
