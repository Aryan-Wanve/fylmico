"use client";

import { Plus } from "lucide-react";
import { LayoutGrid, MoreVertical, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import type { Board } from "@/components/storyboard/storyboard-data";

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
  const lastUpdated = boards[0]?.updatedLabel ?? "—";

  return (
    <div className="grid content-start gap-4">
      <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
        <div className="flex items-center justify-between px-1 pb-2">
          <strong className="text-sm font-bold text-[#11142c]">Boards</strong>
          <button
            aria-label="New board"
            className="grid h-6 w-6 place-items-center rounded-md text-[#8a90a3] hover:bg-black/[0.04] hover:text-[#4b5268]"
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
                    ? "bg-[#654cff]/[0.08] text-[#654cff]"
                    : "hover:bg-black/[0.03]"
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
                        ? "bg-[#654cff] text-white"
                        : "bg-black/[0.04] text-[#8a90a3]"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <strong
                      className={`block truncate text-sm font-bold ${selected ? "text-[#654cff]" : "text-[#11142c]"}`}
                    >
                      {board.name}
                    </strong>
                    <span className="text-xs text-[#8a90a3]">
                      {board.shots.length} frames
                    </span>
                  </span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        aria-label="Board actions"
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[#8a90a3] hover:bg-black/[0.06]"
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

      <div className="grid gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#8a90a3]">Total Frames</span>
          <strong className="text-[#11142c]">{totalFrames}</strong>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#8a90a3]">Total Boards</span>
          <strong className="text-[#11142c]">{boards.length}</strong>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#8a90a3]">Last Updated</span>
          <strong className="text-[#11142c]">{lastUpdated}</strong>
        </div>
        <button
          className="mt-1 flex items-center justify-center gap-2 rounded-lg border border-black/10 py-2 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03]"
          type="button"
        >
          <Settings className="h-4 w-4" />
          Manage Boards
        </button>
      </div>
    </div>
  );
}
