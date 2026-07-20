"use client";

import { useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Home,
  Inbox,
  Pin,
  Search,
  Star,
  Users
} from "lucide-react";
import { HouseChoiceCard } from "@/components/houses/house-choice-card";
import { JoinRequestsDialog } from "@/components/houses/join-requests-dialog";
import { Input } from "@/components/ui/input";
import { formatFileSize } from "@/components/files/file-data";
import { getLastPage } from "@/lib/house-last-page";
import { formatRelativeTime } from "@/lib/relative-time";
import { useWorkspace } from "@/lib/workspace-context";
import {
  activateHouse,
  createHouse,
  joinHouse,
  reorderHouses,
  requestToJoinHouse,
  toggleArchiveHouse,
  toggleFavoriteHouse,
  togglePinHouse
} from "@/services/base-workspace.service";
import type { House } from "@/types/base";
import type { HouseType } from "@/lib/house-types";

function HouseCard({
  house,
  isActive,
  draggable,
  onEnter,
  onToggleFavorite,
  onTogglePin,
  onToggleArchive,
  onOpenJoinRequests,
  onDragStart,
  onDragOver,
  onDrop
}: {
  house: House;
  isActive: boolean;
  draggable: boolean;
  onEnter: () => void;
  onToggleFavorite: () => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onOpenJoinRequests: () => void;
  onDragStart?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDrop?: (event: React.DragEvent) => void;
}) {
  const isPending = house.myRole === null;
  const isOwner = house.myRole === "Owner";

  return (
    <div
      className="group flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-white p-5 text-left shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_1.2rem_3.5rem_rgba(53,45,124,0.1)] dark:border-white/[0.08] dark:bg-[#171a28]"
      draggable={draggable}
      onDragOver={onDragOver}
      onDragStart={onDragStart}
      onDrop={onDrop}
    >
      <button
        className="grid flex-1 gap-3 text-left"
        onClick={onEnter}
        type="button"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#7257ff] to-[#563df0] text-white">
            <Home className="h-5 w-5" />
          </span>
          {isPending ? (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[0.65rem] font-bold text-amber-600">
              Waiting for Approval
            </span>
          ) : isActive ? (
            <span className="rounded-full bg-[var(--fylmico-accent)]/10 px-2 py-0.5 text-[0.65rem] font-bold text-[var(--fylmico-accent)]">
              Active
            </span>
          ) : null}
        </div>
        <div>
          <h3 className="truncate text-base font-bold text-[#11142c] dark:text-[#f1f2f8]">
            {house.name}
          </h3>
          <p className="text-xs font-semibold text-[#667085] dark:text-[#7d8299]">
            @{house.handle}
          </p>
          <p className="mt-1.5 line-clamp-2 text-sm text-[#5f667d] dark:text-[#a8acbf]">
            {house.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#667085] dark:text-[#7d8299]">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {house.members.length} member{house.members.length === 1 ? "" : "s"}
            {house.myRole ? ` · ${house.myRole}` : ""}
          </span>
          {house.storageBytes > 0 ? (
            <span>{formatFileSize(house.storageBytes)}</span>
          ) : null}
          {house.lastActivityAt ? (
            <span>Active {formatRelativeTime(house.lastActivityAt)}</span>
          ) : null}
        </div>
      </button>

      <div className="mt-4 flex items-center gap-1.5">
        <button
          aria-label={house.isFavorite ? "Unfavorite" : "Favorite"}
          className={`grid h-8 w-8 place-items-center rounded-lg border border-black/10 hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.05] ${house.isFavorite ? "text-amber-500" : "text-[#667085] dark:text-[#7d8299]"}`}
          onClick={onToggleFavorite}
          type="button"
        >
          <Star
            className="h-3.5 w-3.5"
            fill={house.isFavorite ? "currentColor" : "none"}
          />
        </button>
        <button
          aria-label={house.isPinned ? "Unpin" : "Pin"}
          className={`grid h-8 w-8 place-items-center rounded-lg border border-black/10 hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.05] ${house.isPinned ? "text-[var(--fylmico-accent)]" : "text-[#667085] dark:text-[#7d8299]"}`}
          onClick={onTogglePin}
          type="button"
        >
          <Pin
            className="h-3.5 w-3.5"
            fill={house.isPinned ? "currentColor" : "none"}
          />
        </button>
        <button
          aria-label={house.isArchived ? "Unarchive" : "Archive"}
          className="grid h-8 w-8 place-items-center rounded-lg border border-black/10 text-[#667085] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#7d8299] dark:hover:bg-white/[0.05]"
          onClick={onToggleArchive}
          type="button"
        >
          {house.isArchived ? (
            <ArchiveRestore className="h-3.5 w-3.5" />
          ) : (
            <Archive className="h-3.5 w-3.5" />
          )}
        </button>
        {isOwner ? (
          <button
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-black/10 py-2 text-xs font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
            onClick={onOpenJoinRequests}
            type="button"
          >
            <Inbox className="h-3.5 w-3.5" />
            Join requests
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function HousesDashboardPage() {
  const router = useRouter();
  const { workspace, refreshWorkspace } = useWorkspace();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState("");
  const [reviewingHouse, setReviewingHouse] = useState<House | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  async function handleEnterHouse(house: House) {
    await activateHouse(house.id);
    await refreshWorkspace();
    router.push((getLastPage(house.id) ?? "/home") as Route);
  }

  async function handleCreateHouse(data: {
    name: string;
    handle: string;
    houseType: HouseType;
  }) {
    setIsSubmitting(true);
    setError("");
    try {
      await createHouse(data);
      await refreshWorkspace();
      router.push("/home");
    } catch (createError) {
      setError(getErrorMessage(createError));
      setIsSubmitting(false);
    }
  }

  async function handleJoinHouse(data: { inviteCode: string }) {
    setIsSubmitting(true);
    setError("");
    try {
      await joinHouse(data);
      await refreshWorkspace();
      router.push("/home");
    } catch (joinError) {
      setError(getErrorMessage(joinError));
      setIsSubmitting(false);
    }
  }

  async function handleRequestJoinHouse(data: { handle: string }) {
    setIsSubmitting(true);
    setError("");
    try {
      await requestToJoinHouse(data);
      setRequestSent(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleFavorite(houseId: string) {
    await toggleFavoriteHouse(houseId);
    await refreshWorkspace();
  }

  async function handleTogglePin(houseId: string) {
    await togglePinHouse(houseId);
    await refreshWorkspace();
  }

  async function handleToggleArchive(houseId: string) {
    await toggleArchiveHouse(houseId);
    await refreshWorkspace();
  }

  async function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const ids = activeHouses.map((house) => house.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    setDragId(null);
    await reorderHouses(ids);
    await refreshWorkspace();
  }

  const term = searchTerm.trim().toLowerCase();
  const matches = (house: House) =>
    !term ||
    house.name.toLowerCase().includes(term) ||
    house.handle.toLowerCase().includes(term);

  const allHouses = workspace.houses.filter(matches);
  const pinnedHouses = allHouses.filter((h) => h.isPinned && !h.isArchived);
  const activeHouses = allHouses.filter((h) => !h.isPinned && !h.isArchived);
  const archivedHouses = allHouses.filter((h) => h.isArchived);

  function cardProps(house: House) {
    return {
      house,
      isActive: house.id === workspace.activeHouseId,
      onEnter: () => handleEnterHouse(house),
      onOpenJoinRequests: () => setReviewingHouse(house),
      onToggleArchive: () => handleToggleArchive(house.id),
      onToggleFavorite: () => handleToggleFavorite(house.id),
      onTogglePin: () => handleTogglePin(house.id)
    };
  }

  return (
    <div className="grid min-h-full grid-cols-1 gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_26rem]">
      <div className="grid content-start gap-6">
        <div>
          <h1 className="text-2xl font-black text-[#11142c] sm:text-3xl dark:text-[#f1f2f8]">
            Your Houses
          </h1>
          <p className="mt-1 text-sm text-[#5f667d] sm:text-base dark:text-[#a8acbf]">
            Pick a house to continue, or create/join another.
          </p>
        </div>

        {workspace.houses.length === 0 ? (
          <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-black/10 bg-white/60 p-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <Home className="h-6 w-6 text-[#667085] dark:text-[#7d8299]" />
            <p className="text-sm text-[#667085] dark:text-[#7d8299]">
              You&apos;re not in a house yet. Create or join one to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="relative max-w-sm">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#667085] dark:text-[#7d8299]" />
              <Input
                className="pl-9"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search houses..."
                value={searchTerm}
              />
            </div>

            {pinnedHouses.length > 0 ? (
              <div className="grid gap-2">
                <h2 className="text-xs font-bold tracking-wide text-[#667085] uppercase dark:text-[#7d8299]">
                  Pinned
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {pinnedHouses.map((house) => (
                    <HouseCard
                      draggable={false}
                      key={house.id}
                      {...cardProps(house)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {activeHouses.map((house) => (
                <HouseCard
                  draggable
                  key={house.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDragStart={() => setDragId(house.id)}
                  onDrop={() => handleDrop(house.id)}
                  {...cardProps(house)}
                />
              ))}
            </div>

            {archivedHouses.length > 0 ? (
              <div className="grid gap-2">
                <button
                  className="justify-self-start text-xs font-bold text-[var(--fylmico-accent)]"
                  onClick={() => setShowArchived((current) => !current)}
                  type="button"
                >
                  {showArchived ? "Hide" : "Show"} archived (
                  {archivedHouses.length})
                </button>
                {showArchived ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {archivedHouses.map((house) => (
                      <HouseCard
                        draggable={false}
                        key={house.id}
                        {...cardProps(house)}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="grid content-start justify-items-center gap-4">
        <HouseChoiceCard
          isSubmitting={isSubmitting}
          onCreateHouse={handleCreateHouse}
          onJoinHouse={handleJoinHouse}
          onRequestJoinHouse={handleRequestJoinHouse}
          requestSent={requestSent}
        />
        {error ? (
          <p className="w-full max-w-[30rem] rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-center text-sm font-semibold text-red-600">
            {error}
          </p>
        ) : null}
      </div>

      {reviewingHouse ? (
        <JoinRequestsDialog
          houseId={reviewingHouse.id}
          houseName={reviewingHouse.name}
          onOpenChange={(open) => {
            if (!open) {
              setReviewingHouse(null);
            }
          }}
          onResolved={refreshWorkspace}
          open={Boolean(reviewingHouse)}
        />
      ) : null}
    </div>
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}
