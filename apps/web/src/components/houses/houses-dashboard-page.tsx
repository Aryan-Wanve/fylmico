"use client";

import { useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Crown,
  Home,
  Inbox,
  LayoutGrid,
  List,
  MoreVertical,
  Pin,
  Search,
  Sparkles,
  Star,
  Users
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
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
import type { House, HouseMember } from "@/types/base";
import type { HouseType } from "@/lib/house-types";

type OwnerFilter = "all" | "owned" | "member";
type SortBy = "recent" | "name" | "members";
type ViewMode = "grid" | "list";

const COVER_GRADIENTS = [
  "from-[#7c5cff] via-[#a855f7] to-[#6d3ff0]",
  "from-[#1e3a8a] via-[#4338ca] to-[#7c3aed]",
  "from-[#be185d] via-[#9333ea] to-[#4c1d95]",
  "from-[#0f172a] via-[#334155] to-[#7c5cff]",
  "from-[#312e81] via-[#6d28d9] to-[#db2777]",
  "from-[#164e63] via-[#4338ca] to-[#7c3aed]"
];

function coverGradientFor(houseId: string): string {
  let hash = 0;
  for (let i = 0; i < houseId.length; i += 1) {
    hash = (hash * 31 + houseId.charCodeAt(i)) & 0xffffffff;
  }
  return COVER_GRADIENTS[Math.abs(hash) % COVER_GRADIENTS.length];
}

function toInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return initials.toUpperCase() || "?";
}

function HouseMemberStack({ members }: { members: HouseMember[] }) {
  const visible = members.slice(0, 4);
  const overflow = members.length - visible.length;

  return (
    <AvatarGroup>
      {visible.map((member) => (
        <Avatar key={member.id} size="sm">
          {member.avatarUrl ? (
            <AvatarImage alt="" src={member.avatarUrl} />
          ) : null}
          <AvatarFallback>{toInitials(member.name)}</AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 ? (
        <AvatarGroupCount className="size-6 text-xs">
          +{overflow}
        </AvatarGroupCount>
      ) : null}
    </AvatarGroup>
  );
}

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
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_1.2rem_3.5rem_rgba(53,45,124,0.1)] dark:border-white/[0.08] dark:bg-[#171a28]"
      draggable={draggable}
      onDragOver={onDragOver}
      onDragStart={onDragStart}
      onDrop={onDrop}
    >
      <div className="relative">
        <button
          className={`h-28 w-full cursor-pointer bg-gradient-to-br ${coverGradientFor(house.id)}`}
          onClick={onEnter}
          type="button"
        />
        <div className="absolute top-2.5 right-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  aria-label="House actions"
                  className="grid h-7 w-7 place-items-center rounded-full bg-black/25 text-white backdrop-blur hover:bg-black/40"
                  type="button"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={onToggleFavorite}>
                <Star
                  className="h-4 w-4"
                  fill={house.isFavorite ? "currentColor" : "none"}
                />
                {house.isFavorite ? "Unfavorite" : "Favorite"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onTogglePin}>
                <Pin
                  className="h-4 w-4"
                  fill={house.isPinned ? "currentColor" : "none"}
                />
                {house.isPinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              {isOwner ? (
                <DropdownMenuItem onClick={onOpenJoinRequests}>
                  <Inbox className="h-4 w-4" />
                  Join requests
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onClick={onToggleArchive}>
                {house.isArchived ? (
                  <ArchiveRestore className="h-4 w-4" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                {house.isArchived ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <span className="absolute right-2.5 bottom-2.5">
          {isPending ? (
            <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[0.65rem] font-bold text-white">
              Waiting for Approval
            </span>
          ) : isActive ? (
            <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-[0.65rem] font-bold text-white">
              Active
            </span>
          ) : null}
        </span>
        <span className="absolute -bottom-5 left-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#7257ff] to-[#563df0] text-white ring-4 ring-white dark:ring-[#171a28]">
          <Home className="h-5 w-5" />
        </span>
      </div>

      <button
        className="grid flex-1 gap-3 p-5 pt-8 text-left"
        onClick={onEnter}
        type="button"
      >
        <div>
          <h3 className="truncate text-base font-bold text-[#11142c] dark:text-[#f1f2f8]">
            {house.name}
          </h3>
          <p className="text-xs font-semibold text-[#667085] dark:text-[#878ca0]">
            @{house.handle}
          </p>
          <p className="mt-1.5 line-clamp-2 text-sm text-[#5f667d] dark:text-[#a8acbf]">
            {house.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#667085] dark:text-[#878ca0]">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {house.members.length} member{house.members.length === 1 ? "" : "s"}
          </span>
          {house.myRole ? (
            <span className="flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              {house.myRole}
            </span>
          ) : null}
          {house.storageBytes > 0 ? (
            <span>{formatFileSize(house.storageBytes)}</span>
          ) : null}
          {house.lastActivityAt ? (
            <span>{formatRelativeTime(house.lastActivityAt)}</span>
          ) : null}
        </div>
      </button>

      <div className="flex items-center justify-between gap-3 border-t border-black/5 px-5 py-3.5 dark:border-white/[0.06]">
        <HouseMemberStack members={house.members} />
        <button
          className="flex items-center gap-1.5 rounded-lg bg-[var(--fylmico-accent)] px-3.5 py-2 text-xs font-bold text-white hover:bg-[var(--fylmico-accent-strong)]"
          onClick={onEnter}
          type="button"
        >
          Open House →
        </button>
      </div>
    </div>
  );
}

function HouseListRow({
  house,
  isActive,
  onEnter,
  onToggleFavorite,
  onTogglePin,
  onToggleArchive,
  onOpenJoinRequests
}: {
  house: House;
  isActive: boolean;
  onEnter: () => void;
  onToggleFavorite: () => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onOpenJoinRequests: () => void;
}) {
  const isPending = house.myRole === null;
  const isOwner = house.myRole === "Owner";

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-black/5 p-4 last:border-b-0 dark:border-white/[0.06]">
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white ${coverGradientFor(house.id)}`}
      >
        <Home className="h-5 w-5" />
      </span>
      <button
        className="min-w-0 flex-1 text-left"
        onClick={onEnter}
        type="button"
      >
        <div className="flex items-center gap-2">
          <strong className="truncate text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            {house.name}
          </strong>
          <span className="text-xs font-semibold text-[#667085] dark:text-[#878ca0]">
            @{house.handle}
          </span>
          {isPending ? (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[0.6rem] font-bold text-amber-600 dark:bg-amber-500/10">
              Waiting for Approval
            </span>
          ) : isActive ? (
            <span className="rounded-full bg-[var(--fylmico-accent)]/10 px-2 py-0.5 text-[0.6rem] font-bold text-[var(--fylmico-accent)]">
              Active
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs font-semibold text-[#667085] dark:text-[#878ca0]">
          <span>
            {house.members.length} member{house.members.length === 1 ? "" : "s"}
          </span>
          {house.myRole ? <span>{house.myRole}</span> : null}
          {house.storageBytes > 0 ? (
            <span>{formatFileSize(house.storageBytes)}</span>
          ) : null}
          {house.lastActivityAt ? (
            <span>{formatRelativeTime(house.lastActivityAt)}</span>
          ) : null}
        </div>
      </button>
      <HouseMemberStack members={house.members} />
      <button
        className="rounded-lg bg-[var(--fylmico-accent)] px-3.5 py-2 text-xs font-bold text-white hover:bg-[var(--fylmico-accent-strong)]"
        onClick={onEnter}
        type="button"
      >
        Open House →
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              aria-label="House actions"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#667085] hover:bg-black/[0.04] dark:text-[#878ca0] dark:hover:bg-white/[0.06]"
              type="button"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={onToggleFavorite}>
            <Star
              className="h-4 w-4"
              fill={house.isFavorite ? "currentColor" : "none"}
            />
            {house.isFavorite ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onTogglePin}>
            <Pin
              className="h-4 w-4"
              fill={house.isPinned ? "currentColor" : "none"}
            />
            {house.isPinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          {isOwner ? (
            <DropdownMenuItem onClick={onOpenJoinRequests}>
              <Inbox className="h-4 w-4" />
              Join requests
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onClick={onToggleArchive}>
            {house.isArchived ? (
              <ArchiveRestore className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            {house.isArchived ? "Unarchive" : "Archive"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

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

  const matchesOwnerFilter = (house: House) => {
    if (ownerFilter === "owned") return house.myRole === "Owner";
    if (ownerFilter === "member") return house.myRole !== "Owner";
    return true;
  };

  function sortHouses(list: House[]): House[] {
    const sorted = [...list];
    if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "members") {
      sorted.sort((a, b) => b.members.length - a.members.length);
    } else {
      sorted.sort((a, b) => {
        const aTime = a.lastActivityAt
          ? new Date(a.lastActivityAt).getTime()
          : 0;
        const bTime = b.lastActivityAt
          ? new Date(b.lastActivityAt).getTime()
          : 0;
        return bTime - aTime;
      });
    }
    return sorted;
  }

  const allHouses = workspace.houses.filter(
    (house) => matches(house) && matchesOwnerFilter(house)
  );
  const pinnedHouses = sortHouses(
    allHouses.filter((h) => h.isPinned && !h.isArchived)
  );
  const activeHouses = sortHouses(
    allHouses.filter((h) => !h.isPinned && !h.isArchived)
  );
  const archivedHouses = sortHouses(allHouses.filter((h) => h.isArchived));

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

  const gridClasses = "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3";

  return (
    <div className="grid min-h-full grid-cols-1 gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_26rem]">
      <div className="grid content-start gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--fylmico-accent)]/10 px-3 py-1 text-xs font-bold tracking-wide text-[var(--fylmico-accent)] uppercase">
            <Home className="h-3.5 w-3.5" />
            Houses
          </span>
          <h1 className="mt-3 text-2xl leading-tight font-black text-[#11142c] sm:text-3xl dark:text-[#f1f2f8]">
            Your creative universe.
            <br />
            <span className="bg-gradient-to-r from-[var(--fylmico-accent)] to-pink-500 bg-clip-text text-transparent">
              Find your hub.
            </span>
          </h1>
          <p className="mt-2 max-w-lg text-sm text-[#5f667d] sm:text-base dark:text-[#a8acbf]">
            Join an existing house or create your own. Build, collaborate and
            bring your ideas to life.
          </p>
        </div>

        {workspace.houses.length === 0 ? (
          <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-black/10 bg-white/60 p-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <Home className="h-6 w-6 text-[#667085] dark:text-[#878ca0]" />
            <p className="text-sm text-[#667085] dark:text-[#878ca0]">
              You&apos;re not in a house yet. Create or join one to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-0 flex-1 sm:max-w-xs">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#667085] dark:text-[#878ca0]" />
                <Input
                  className="pl-9"
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search houses, tags, owners..."
                  value={searchTerm}
                />
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-black/[0.04] p-1 dark:bg-white/[0.06]">
                {(
                  [
                    { value: "all", label: "All" },
                    { value: "owned", label: "Owned by me" },
                    { value: "member", label: "Member" }
                  ] as { value: OwnerFilter; label: string }[]
                ).map((option) => (
                  <button
                    aria-pressed={ownerFilter === option.value}
                    className={`flex h-7 items-center rounded-md px-2.5 text-sm font-semibold ${
                      ownerFilter === option.value
                        ? "bg-white text-[#11142c] shadow-sm dark:bg-[#171a28] dark:text-[#f1f2f8]"
                        : "text-[#667085] hover:text-[#4b5268] dark:text-[#878ca0] dark:hover:text-[#c7cad9]"
                    }`}
                    key={option.value}
                    onClick={() => setOwnerFilter(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <Select
                onValueChange={(value) => setSortBy(value as SortBy)}
                value={sortBy}
              >
                <SelectTrigger className="bg-white dark:bg-[#171a28]" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently active</SelectItem>
                  <SelectItem value="name">Name A–Z</SelectItem>
                  <SelectItem value="members">Most members</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 rounded-lg bg-black/[0.04] p-1 dark:bg-white/[0.06]">
                <button
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                  className={`grid h-7 w-7 place-items-center rounded-md ${
                    viewMode === "grid"
                      ? "bg-white text-[#11142c] shadow-sm dark:bg-[#171a28] dark:text-[#f1f2f8]"
                      : "text-[#667085] hover:text-[#4b5268] dark:text-[#878ca0] dark:hover:text-[#c7cad9]"
                  }`}
                  onClick={() => setViewMode("grid")}
                  type="button"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                  className={`grid h-7 w-7 place-items-center rounded-md ${
                    viewMode === "list"
                      ? "bg-white text-[#11142c] shadow-sm dark:bg-[#171a28] dark:text-[#f1f2f8]"
                      : "text-[#667085] hover:text-[#4b5268] dark:text-[#878ca0] dark:hover:text-[#c7cad9]"
                  }`}
                  onClick={() => setViewMode("list")}
                  type="button"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {pinnedHouses.length > 0 ? (
              <div className="grid gap-2">
                <h2 className="text-xs font-bold tracking-wide text-[#667085] uppercase dark:text-[#878ca0]">
                  Pinned
                </h2>
                {viewMode === "grid" ? (
                  <div className={gridClasses}>
                    {pinnedHouses.map((house) => (
                      <HouseCard
                        draggable={false}
                        key={house.id}
                        {...cardProps(house)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#171a28]">
                    {pinnedHouses.map((house) => (
                      <HouseListRow key={house.id} {...cardProps(house)} />
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {viewMode === "grid" ? (
              <div className={gridClasses}>
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
            ) : (
              <div className="rounded-2xl border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#171a28]">
                {activeHouses.map((house) => (
                  <HouseListRow key={house.id} {...cardProps(house)} />
                ))}
              </div>
            )}

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
                  viewMode === "grid" ? (
                    <div className={gridClasses}>
                      {archivedHouses.map((house) => (
                        <HouseCard
                          draggable={false}
                          key={house.id}
                          {...cardProps(house)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#171a28]">
                      {archivedHouses.map((house) => (
                        <HouseListRow key={house.id} {...cardProps(house)} />
                      ))}
                    </div>
                  )
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-black/[0.06] bg-gradient-to-br from-[var(--fylmico-accent)]/5 to-pink-500/5 p-6 dark:border-white/[0.08]">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[var(--fylmico-accent)] to-pink-500 text-white">
                  <Sparkles className="h-6 w-6" />
                </span>
                <div>
                  <strong className="flex items-center gap-1.5 text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                    Houses are more than just teams
                  </strong>
                  <p className="mt-1 max-w-xl text-sm text-[#5f667d] dark:text-[#a8acbf]">
                    They&apos;re your creative universe. Organize projects,
                    manage tasks, store files, chat with your crew, and build
                    something legendary.
                  </p>
                </div>
              </div>
              <a
                className="shrink-0 rounded-lg border border-[var(--fylmico-accent)]/30 px-4 py-2 text-sm font-bold text-[var(--fylmico-accent)] hover:bg-[var(--fylmico-accent)]/5"
                href="/houses/learn"
              >
                Learn more →
              </a>
            </div>
          </>
        )}
      </div>

      <div className="grid content-start justify-items-center gap-4 lg:sticky lg:top-6 lg:self-start">
        <HouseChoiceCard
          isSubmitting={isSubmitting}
          onCreateHouse={handleCreateHouse}
          onJoinHouse={handleJoinHouse}
          onRequestJoinHouse={handleRequestJoinHouse}
          requestSent={requestSent}
        />
        {error ? (
          <p className="animate-in fade-in slide-in-from-top-1 w-full max-w-[26rem] rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-center text-sm font-semibold text-red-600 duration-200">
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
