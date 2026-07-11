"use client";

import { useEffect, useState } from "react";
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
  characters,
  storyLocations,
  boardTemplates,
  type BoardTemplate
} from "@/components/storyboard/storyboard-data";
import {
  createBoard,
  createShot,
  deleteBoard,
  listBoards,
  listProjects,
  updateShot
} from "@/services/base-workspace.service";
import type { Board, Project } from "@/types/base";

export function StoryboardPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<StoryboardTab>("boards");
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<BoardViewMode>("grid");
  const [zoom, setZoom] = useState(50);
  const [density, setDensity] = useState<"compact" | "comfortable">(
    "comfortable"
  );

  useEffect(() => {
    let cancelled = false;

    Promise.all([listBoards(), listProjects()])
      .then(([boardData, projectData]) => {
        if (!cancelled) {
          setBoards(boardData);
          setProjects(projectData);
          setActiveBoardId(boardData[0]?.id ?? null);
          setSelectedShotId(boardData[0]?.shots[0]?.id ?? null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          window.alert(
            error instanceof Error ? error.message : "Could not load boards."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleBoards = projectId
    ? boards.filter((board) => board.projectId === projectId)
    : boards;
  const activeBoard =
    visibleBoards.find((board) => board.id === activeBoardId) ??
    visibleBoards[0];
  const selectedShot = activeBoard?.shots.find(
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

  async function handleUpdateShot(updates: {
    description?: string;
    cameraAngle?: string;
    notes?: string;
  }) {
    if (!activeBoard || !selectedShotId) {
      return;
    }

    try {
      const updated = await updateShot(selectedShotId, updates);
      setBoards((current) =>
        current.map((board) =>
          board.id !== activeBoard.id
            ? board
            : {
                ...board,
                shots: board.shots.map((shot) =>
                  shot.id === selectedShotId ? updated : shot
                )
              }
        )
      );
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not update the shot."
      );
    }
  }

  async function handleNewBoard() {
    const name = window.prompt("New board name");
    if (!name || !name.trim()) {
      return;
    }

    try {
      const board = await createBoard({
        name: name.trim(),
        projectId: projectId ?? undefined
      });
      setBoards((current) => [board, ...current]);
      setActiveBoardId(board.id);
      setSelectedShotId(null);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not create the board."
      );
    }
  }

  async function handleDeleteBoard(id: string) {
    try {
      await deleteBoard(id);
      setBoards((current) => {
        const next = current.filter((board) => board.id !== id);
        if (id === activeBoardId) {
          setActiveBoardId(next[0]?.id ?? null);
          setSelectedShotId(next[0]?.shots[0]?.id ?? null);
        }
        return next;
      });
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not delete the board."
      );
    }
  }

  async function handleUseTemplate(template: BoardTemplate) {
    try {
      const board = await createBoard({
        name: template.name,
        projectId: projectId ?? undefined,
        shots: Array.from({ length: template.frameCount }, (_, index) => ({
          description: "New shot — add a description.",
          cameraAngle: "Medium Shot",
          order: index
        }))
      });
      setBoards((current) => [board, ...current]);
      setActiveBoardId(board.id);
      setSelectedShotId(board.shots[0]?.id ?? null);
      setActiveTab("boards");
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not create a board from this template."
      );
    }
  }

  async function handleAddShot() {
    if (!activeBoard) {
      return;
    }

    try {
      const shot = await createShot(activeBoard.id, {
        description: "New shot — add a description."
      });
      setBoards((current) =>
        current.map((board) =>
          board.id !== activeBoard.id
            ? board
            : { ...board, shots: [...board.shots, shot] }
        )
      );
      setSelectedShotId(shot.id);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not add a shot."
      );
    }
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
        onProjectChange={setProjectId}
        onTabChange={setActiveTab}
        projectId={projectId}
        projects={projects}
      />

      {loading ? (
        <p className="py-16 text-center text-sm text-[#8a90a3]">
          Loading storyboards...
        </p>
      ) : activeTab === "boards" ? (
        visibleBoards.length === 0 ? (
          <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-black/10 bg-white/60 py-16 text-center">
            <strong className="text-sm font-bold text-[#11142c]">
              No boards yet
            </strong>
            <p className="max-w-xs text-sm text-[#8a90a3]">
              Create a board to start planning your shots.
            </p>
          </div>
        ) : (
          <div
            className={`grid min-w-0 gap-6 ${
              showDetailPanel
                ? "xl:grid-cols-[16rem_1fr_22rem]"
                : "xl:grid-cols-[16rem_1fr]"
            }`}
          >
            <BoardsPanel
              activeBoardId={activeBoard?.id ?? ""}
              boards={visibleBoards}
              onDeleteBoard={handleDeleteBoard}
              onNewBoard={handleNewBoard}
              onSelectBoard={handleSelectBoard}
            />

            {activeBoard ? (
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
                    <button
                      className="mt-1 rounded-lg bg-[#654cff] px-4 py-2 text-sm font-bold text-white hover:bg-[#5a41ea]"
                      onClick={handleAddShot}
                      type="button"
                    >
                      Add Shot
                    </button>
                  </div>
                ) : (
                  <>
                    {viewMode === "grid" ? (
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
                    <button
                      className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-black/15 py-2.5 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03]"
                      onClick={handleAddShot}
                      type="button"
                    >
                      + Add Shot
                    </button>
                  </>
                )}
              </div>
            ) : null}

            {showDetailPanel && selectedShot && activeBoard ? (
              <ShotDetailPanel
                index={activeBoard.shots.findIndex(
                  (shot) => shot.id === selectedShot.id
                )}
                onClose={() => setSelectedShotId(null)}
                onUpdate={handleUpdateShot}
                shot={selectedShot}
              />
            ) : null}
          </div>
        )
      ) : activeTab === "shots" ? (
        <ShotsListView
          boards={visibleBoards}
          onSelectShot={handleSelectShotInBoard}
        />
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
