import { Camera } from "lucide-react";
import type { Shot } from "@/types/base";

export function ShotCard({
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
    <article
      className={`overflow-hidden rounded-xl border bg-white shadow-[0_0.6rem_1.8rem_rgba(53,45,124,0.06)] dark:bg-[#171a28] ${
        selected
          ? "border-[#654cff] ring-2 ring-[#654cff]/30"
          : "border-black/[0.06] dark:border-white/[0.08]"
      }`}
    >
      <button
        className="relative flex h-40 w-full items-center justify-center bg-gradient-to-b from-[#f4f4f8] to-[#e7e7ee] dark:from-[#20232f] dark:to-[#262a3a]"
        onClick={onSelect}
        type="button"
      >
        <Camera className="h-12 w-12 text-[#8a90a3]/60" strokeWidth={1.25} />
        {shot.cameraAngle ? (
          <span className="absolute top-2 right-2 rounded-md bg-[#654cff]/85 px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
            {shot.cameraAngle}
          </span>
        ) : null}
      </button>

      <div className="p-3">
        <div className="flex items-center gap-2">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-black/[0.06] text-[0.7rem] text-[#4b5268] dark:bg-white/[0.08] dark:text-[#c7cad9]">
            {index + 1}
          </span>
          <span className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            Shot {index + 1}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-[#5f667d] dark:text-[#a8acbf]">
          {shot.description}
        </p>
      </div>
    </article>
  );
}
