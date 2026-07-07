import type { Board } from "@/components/storyboard/storyboard-data";
import { ShotListRow } from "@/components/storyboard/shot-list-row";

export function ShotsListView({
  boards,
  onSelectShot
}: {
  boards: Board[];
  onSelectShot: (boardId: string, shotId: string) => void;
}) {
  return (
    <div className="grid gap-4">
      {boards.map((board) => (
        <div
          className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]"
          key={board.id}
        >
          <div className="flex items-center gap-2 border-b border-black/5 bg-[#fafafd] px-4 py-2.5">
            <strong className="text-sm font-bold text-[#11142c]">
              {board.name}
            </strong>
            <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-xs font-bold text-[#4b5268]">
              {board.shots.length}
            </span>
          </div>
          {board.shots.map((shot, index) => (
            <ShotListRow
              index={index}
              key={shot.id}
              onSelect={() => onSelectShot(board.id, shot.id)}
              selected={false}
              shot={shot}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
