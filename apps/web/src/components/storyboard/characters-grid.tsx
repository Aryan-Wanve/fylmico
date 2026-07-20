import { Trash2, UserCircle2 } from "lucide-react";
import type { StoryCharacter } from "@/types/base";

export function CharactersGrid({
  characters,
  onDelete
}: {
  characters: StoryCharacter[];
  onDelete: (characterId: string) => void;
}) {
  if (characters.length === 0) {
    return (
      <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-black/10 bg-white/60 py-16 text-center dark:border-white/10 dark:bg-[#171a28]/60">
        <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          No characters yet
        </strong>
        <p className="max-w-xs text-sm text-[#8a90a3] dark:text-[#7d8299]">
          Add characters to keep track of who&apos;s in your story.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {characters.map((character) => (
        <article
          className="group relative rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]"
          key={character.id}
        >
          <button
            aria-label={`Delete ${character.name}`}
            className="absolute top-3 right-3 hidden h-7 w-7 place-items-center rounded-full text-[#8a90a3] group-hover:grid hover:bg-red-50 hover:text-red-600 dark:text-[#7d8299]"
            onClick={() => onDelete(character.id)}
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--fylmico-accent)]/10 text-[var(--fylmico-accent)]">
              <UserCircle2 className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <strong className="block truncate text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                {character.name}
              </strong>
              <span className="text-xs font-semibold text-[var(--fylmico-accent)]">
                {character.role}
              </span>
            </div>
          </div>
          {character.description ? (
            <p className="mt-3 text-sm leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
              {character.description}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
