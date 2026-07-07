import { UserCircle2 } from "lucide-react";
import type { Character } from "@/components/storyboard/storyboard-data";

export function CharactersGrid({ characters }: { characters: Character[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {characters.map((character) => (
        <article
          className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]"
          key={character.id}
        >
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#654cff]/10 text-[#654cff]">
              <UserCircle2 className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <strong className="block truncate text-sm font-bold text-[#11142c]">
                {character.name}
              </strong>
              <span className="text-xs font-semibold text-[#654cff]">
                {character.role}
              </span>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#5f667d]">
            {character.description}
          </p>
        </article>
      ))}
    </div>
  );
}
