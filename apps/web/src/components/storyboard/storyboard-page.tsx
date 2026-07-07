"use client";

import { useState } from "react";
import { StoryboardHeader } from "@/components/storyboard/storyboard-header";
import {
  StoryboardToolbar,
  type StoryboardTab
} from "@/components/storyboard/storyboard-toolbar";
import { BoardsPanel } from "@/components/storyboard/boards-panel";
import {
  BoardToolbar,
  type BoardViewMode
} from "@/components/storyboard/board-toolbar";
import { ShotCard } from "@/components/storyboard/shot-card";
import { ShotListRow } from "@/components/storyboard/shot-list-row";
import { ShotDetailPanel } from "@/components/storyboard/shot-detail-panel";
import { ShotsListView } from "@/components/storyboard/shots-list-view";
import { CharactersGrid } from "@/components/storyboard/characters-grid";
import { LocationsGrid } from "@/components/storyboard/locations-grid";
import { TemplatesGrid } from "@/components/storyboard/templates-grid";
import {
  boards as defaultBoards,
  characters,
  storyLocations,
  boardTemplates,
  type Board,
  type BoardTemplate,
  type Shot
} from "@/components/storyboard/storyboard-data";
import { LayoutGrid } from "lucide-react";

export function StoryboardPage() {
  const [project, setProject] = useState("Beyond Frames");
  const [activeTab, setActiveTab] = useState<StoryboardTab>("boards");
  const [boards, setBoards] = useState<Board[]>(defaultBoards);
  const [activeBoardId, setActiveBoardId] = useState(defaultBoards[0].id);
  const [selectedShotId, setSelectedShotId] = useState<string | null>(
    defaultBoards[0].shots[0]?.id ?? null
  );
  const [viewMode, setViewMode] = useState<BoardViewMode>("grid");
  const [zoom, setZoom] = useState(50);
  const [density, setDensity] = useState<"compact" | "comfortable">(
    "comfortable"
  );

  const activeBoard =
    boards.find((board) => board.id === activeBoardId) ?? boards[0];
  const selectedShot = activeBoard.shots.find(
    (shot) => shot.id === selectedShotId
  );

  function handleSelectBoard(id: string) {
    setActiveBoardId(id);
    const board = boards.find((entry) => entry.id === id);
    setSelectedShotId(board?.shots[0]?.id ?? null);
  }

  function handleSelectShotInBoard(boardId: string, shotId: string) {
    setActiveTab("boards");
    setActiveBoardId(boardId);
    setSelectedShotId(shotId);
  }

  function handleUpdateShot(updates: Partial<Shot>) {
    setBoards((current) =>
      current.map((board) =>
        board.id !== activeBoardId
          ? board
          : {
              ...board,
              shots: board.shots.map((shot) =>
                shot.id === selectedShotId ? { ...shot, ...updates } : shot
              )
            }
      )
    );
  }

  function handleNewBoard() {
    const name = window.prompt("New board name");

    if (!name || !name.trim()) {
      return;
    }

    const board: Board = {
      id: `board-${Date.now()}`,
      name: name.trim(),
      updatedLabel: "Just now",
      shots: []
    };

    setBoards((current) => [board, ...current]);
    setActiveBoardId(board.id);
    setSelectedShotId(null);
  }

  function handleDeleteBoard(id: string) {
    setBoards((current) => {
      const next = current.filter((board) => board.id !== id);
      if (id === activeBoardId && next.length > 0) {
        setActiveBoardId(next[0].id);
        setSelectedShotId(next[0].shots[0]?.id ?? null);
      }
      return next;
    });
  }

  function handleUseTemplate(template: BoardTemplate) {
    const board: Board = {
      id: `board-${Date.now()}`,
      name: template.name,
      updatedLabel: "Just now",
      shots: Array.from({ length: template.frameCount }, (_, index) => ({
        id: `template-shot-${Date.now()}-${index}`,
        number: `${index + 1}`,
        description: "New shot — add a description.",
        shotType: "MS",
        durationSec: 3,
        camera: "Medium Shot (MS)",
        lensMovement: "Static",
        tags: [],
        attachedFiles: [],
        icon: LayoutGrid
      }))
    };

    setBoards((current) => [board, ...current]);
    setActiveBoardId(board.id);
    setSelectedShotId(board.shots[0]?.id ?? null);
    setActiveTab("boards");
  }

  const showDetailPanel = activeTab === "boards" && Boolean(selectedShot);

  return (
    <div className="grid gap-6 p-8">
      <StoryboardHeader />
      <StoryboardToolbar
        activeTab={activeTab}
        density={density}
        onDensityChange={setDensity}
        onNewBoard={handleNewBoard}
        onProjectChange={setProject}
        onTabChange={setActiveTab}
        project={project}
      />

      {activeTab === "boards" ? (
        <div
          className={`grid min-w-0 gap-6 ${
            showDetailPanel
              ? "xl:grid-cols-[16rem_1fr_22rem]"
              : "xl:grid-cols-[16rem_1fr]"
          }`}
        >
          <BoardsPanel
            activeBoardId={activeBoardId}
            boards={boards}
            onDeleteBoard={handleDeleteBoard}
            onNewBoard={handleNewBoard}
            onSelectBoard={handleSelectBoard}
          />

          <div className="grid min-w-0 content-start gap-4">
            <BoardToolbar
              board={activeBoard}
              onPresent={() =>
                window.alert(
                  "Presentation mode isn't available in this preview."
                )
              }
              onViewModeChange={setViewMode}
              onZoomChange={setZoom}
              viewMode={viewMode}
              zoom={zoom}
            />

            {activeBoard.shots.length === 0 ? (
              <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-black/10 bg-white/60 py-16 text-center">
                <strong className="text-sm font-bold text-[#11142c]">
                  This board has no shots yet
                </strong>
                <p className="max-w-xs text-sm text-[#8a90a3]">
                  Add shots to start planning this sequence.
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(auto-fill, minmax(${140 + zoom * 1.2}px, 1fr))`
                }}
              >
                {activeBoard.shots.map((shot, index) => (
                  <ShotCard
                    index={index}
                    key={shot.id}
                    onSelect={() => setSelectedShotId(shot.id)}
                    selected={shot.id === selectedShotId}
                    shot={shot}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
                {activeBoard.shots.map((shot, index) => (
                  <ShotListRow
                    index={index}
                    key={shot.id}
                    onSelect={() => setSelectedShotId(shot.id)}
                    selected={shot.id === selectedShotId}
                    shot={shot}
                  />
                ))}
              </div>
            )}
          </div>

          {showDetailPanel && selectedShot ? (
            <ShotDetailPanel
              onClose={() => setSelectedShotId(null)}
              onUpdate={handleUpdateShot}
              shot={selectedShot}
            />
          ) : null}
        </div>
      ) : activeTab === "shots" ? (
        <ShotsListView boards={boards} onSelectShot={handleSelectShotInBoard} />
      ) : activeTab === "characters" ? (
        <CharactersGrid characters={characters} />
      ) : activeTab === "locations" ? (
        <LocationsGrid locations={storyLocations} />
      ) : (
        <TemplatesGrid
          onUseTemplate={handleUseTemplate}
          templates={boardTemplates}
        />
      )}
    </div>
  );
}
