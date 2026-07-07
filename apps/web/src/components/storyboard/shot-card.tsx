import { Clock, MoreVertical } from "lucide-react";
import type { Shot } from "@/components/storyboard/storyboard-data";
import { SHOT_TYPE_BADGE } from "@/components/storyboard/shot-type-meta";

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
  const Icon = shot.icon;

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-white shadow-[0_0.6rem_1.8rem_rgba(53,45,124,0.06)] ${
        selected
          ? "border-[#654cff] ring-2 ring-[#654cff]/30"
          : "border-black/[0.06]"
      }`}
    >
      <button
        className="relative flex h-40 w-full items-center justify-center bg-gradient-to-b from-[#f4f4f8] to-[#e7e7ee]"
        onClick={onSelect}
        type="button"
      >
        <Icon className="h-12 w-12 text-[#8a90a3]/60" strokeWidth={1.25} />
        <span
          className={`absolute top-2 right-2 rounded-md px-1.5 py-0.5 text-[0.65rem] font-bold text-white ${SHOT_TYPE_BADGE[shot.shotType]}`}
        >
          {shot.shotType}
        </span>
      </button>

      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-sm font-bold text-[#11142c]">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-black/[0.06] text-[0.7rem] text-[#4b5268]">
              {index + 1}
            </span>
            Shot {shot.number}
          </span>
          <button
            aria-label="Shot actions"
            className="grid h-6 w-6 place-items-center rounded-full text-[#8a90a3] hover:bg-black/[0.04]"
            onClick={(event) => event.stopPropagation()}
            type="button"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-[#5f667d]">
          {shot.description}
        </p>
        {shot.durationSec > 0 ? (
          <span className="mt-2 flex items-center gap-1 text-xs font-medium text-[#8a90a3]">
            <Clock className="h-3 w-3" />
            {shot.durationSec}s
          </span>
        ) : null}
      </div>
    </article>
  );
}
