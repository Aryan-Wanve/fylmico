"use client";

import { Plus } from "lucide-react";
import { LayoutGrid, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime } from "@/lib/relative-time";
import type { Board } from "@/types/base";

export function BoardsPanel({
  boards,
  activeBoardId,
  onSelectBoard,
  onNewBoard,
  onDeleteBoard
}: {
  boards: Board[];
  activeBoardId: string;
  onSelectBoard: (id: string) => void;
  onNewBoard: () => void;
  onDeleteBoard: (id: string) => void;
}) {
  const totalFrames = boards.reduce(
    (sum, board) => sum + board.shots.length,
    0
  );
  const lastUpdated = boards[0] ? formatRelativeTime(boards[0].updatedAt) : "—";

  return (
    <div className="grid content-start gap-4">
      <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <div className="flex items-center justify-between px-1 pb-2">
          <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            Boards
          </strong>
          <button
            aria-label="New board"
            className="grid h-6 w-6 place-items-center rounded-md text-[#667085] hover:bg-black/[0.04] hover:text-[#4b5268] dark:text-[#7d8299] dark:hover:bg-white/[0.06] dark:hover:text-[#c7cad9]"
            onClick={onNewBoard}
            type="button"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-1">
          {boards.map((board) => {
            const selected = board.id === activeBoardId;

            return (
              <div
                className={`flex items-center gap-2 rounded-xl px-2 py-2 ${
                  selected
                    ? "bg-[var(--fylmico-accent)]/[0.08] text-[var(--fylmico-accent)]"
                    : "hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                }`}
                key={board.id}
              >
                <button
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  onClick={() => onSelectBoard(board.id)}
                  type="button"
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                      selected
                        ? "bg-[var(--fylmico-accent)] text-white"
                        : "bg-black/[0.04] text-[#667085] dark:bg-white/[0.06] dark:text-[#7d8299]"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <strong
                      className={`block truncate text-sm font-bold ${selected ? "text-[var(--fylmico-accent)]" : "text-[#11142c] dark:text-[#f1f2f8]"}`}
                    >
                      {board.name}
                    </strong>
                    <span className="text-xs text-[#667085] dark:text-[#7d8299]">
                      {board.shots.length} frames
                    </span>
                  </span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        aria-label="Board actions"
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[#667085] hover:bg-black/[0.06] dark:text-[#7d8299] dark:hover:bg-white/[0.08]"
                        type="button"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem
                      onClick={() => onDeleteBoard(board.id)}
                      variant="destructive"
                    >
                      Delete board
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#667085] dark:text-[#7d8299]">
            Total Frames
          </span>
          <strong className="text-[#11142c] dark:text-[#f1f2f8]">
            {totalFrames}
          </strong>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#667085] dark:text-[#7d8299]">
            Total Boards
          </span>
          <strong className="text-[#11142c] dark:text-[#f1f2f8]">
            {boards.length}
          </strong>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#667085] dark:text-[#7d8299]">
            Last Updated
          </span>
          <strong className="text-[#11142c] dark:text-[#f1f2f8]">
            {lastUpdated}
          </strong>
        </div>
      </div>
    </div>
  );
}
