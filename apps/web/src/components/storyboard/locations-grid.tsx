import { MapPin } from "lucide-react";
import type { StoryLocation } from "@/components/storyboard/storyboard-data";

export function LocationsGrid({ locations }: { locations: StoryLocation[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {locations.map((location) => (
        <article
          className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]"
          key={location.id}
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <MapPin className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <strong className="block truncate text-sm font-bold text-[#11142c]">
              {location.name}
            </strong>
            <span className="text-xs text-[#8a90a3]">{location.type}</span>
          </div>
          <span className="shrink-0 rounded-full bg-black/[0.06] px-2 py-0.5 text-xs font-bold text-[#4b5268]">
            {location.shotCount} shots
          </span>
        </article>
      ))}
    </div>
  );
}
