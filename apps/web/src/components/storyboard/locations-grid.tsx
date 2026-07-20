import { MapPin, Trash2 } from "lucide-react";
import type { StoryLocationItem } from "@/types/base";

export function LocationsGrid({
  locations,
  onDelete
}: {
  locations: StoryLocationItem[];
  onDelete: (locationId: string) => void;
}) {
  if (locations.length === 0) {
    return (
      <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-black/10 bg-white/60 py-16 text-center dark:border-white/10 dark:bg-[#171a28]/60">
        <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          No locations yet
        </strong>
        <p className="max-w-xs text-sm text-[#667085] dark:text-[#7d8299]">
          Add locations to track where your shots take place.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {locations.map((location) => (
        <article
          className="group relative flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]"
          key={location.id}
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <MapPin className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <strong className="block truncate text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
              {location.name}
            </strong>
            <span className="text-xs text-[#667085] dark:text-[#7d8299]">
              {location.type}
            </span>
          </div>
          <span className="shrink-0 rounded-full bg-black/[0.06] px-2 py-0.5 text-xs font-bold text-[#4b5268] dark:bg-white/[0.08] dark:text-[#c7cad9]">
            {location.shotCount} shots
          </span>
          <button
            aria-label={`Delete ${location.name}`}
            className="absolute top-2 right-2 hidden h-7 w-7 place-items-center rounded-full text-[#667085] group-hover:grid hover:bg-red-50 hover:text-red-600 dark:text-[#7d8299]"
            onClick={() => onDelete(location.id)}
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </article>
      ))}
    </div>
  );
}
