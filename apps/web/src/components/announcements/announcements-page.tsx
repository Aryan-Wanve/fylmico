"use client";

import { useEffect, useMemo, useState } from "react";
import { Megaphone, Pin, Plus, Trash2 } from "lucide-react";
import { useWorkspace } from "@/lib/workspace-context";
import { formatRelativeTime } from "@/lib/relative-time";
import {
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  updateAnnouncement
} from "@/services/base-workspace.service";
import { NewAnnouncementDialog } from "@/components/announcements/new-announcement-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Announcement, CreateAnnouncementRequest } from "@/types/base";

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return initials.toUpperCase() || "?";
}

export function AnnouncementsPage() {
  const { activeHouse, workspace } = useWorkspace();
  const isOwner =
    activeHouse?.members.find((member) => member.id === workspace.user.id)
      ?.role === "Owner";

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    listAnnouncements()
      .then((data) => {
        if (!cancelled) {
          setAnnouncements(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          window.alert(
            error instanceof Error
              ? error.message
              : "Could not load announcements."
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

  const sorted = useMemo(
    () =>
      [...announcements].sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }),
    [announcements]
  );

  async function handleCreate(request: CreateAnnouncementRequest) {
    const created = await createAnnouncement(request);
    setAnnouncements((current) => [created, ...current]);
  }

  async function handleTogglePin(announcement: Announcement) {
    try {
      const updated = await updateAnnouncement(announcement.id, {
        pinned: !announcement.pinned
      });
      setAnnouncements((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not update the announcement."
      );
    }
  }

  async function handleDelete(announcement: Announcement) {
    if (!window.confirm(`Delete "${announcement.title}"?`)) {
      return;
    }

    try {
      await deleteAnnouncement(announcement.id);
      setAnnouncements((current) =>
        current.filter((item) => item.id !== announcement.id)
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not delete the announcement."
      );
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-black text-[#11142c] sm:text-3xl dark:text-[#f1f2f8]">
            Announcements
          </h1>
          <p className="mt-1 text-sm text-[#5f667d] sm:text-base dark:text-[#a8acbf]">
            House-wide updates from your production leads.
          </p>
        </div>
        {isOwner ? (
          <button
            className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[var(--fylmico-accent)] px-4 text-sm font-bold text-white hover:bg-[var(--fylmico-accent-strong)]"
            onClick={() => setCreateOpen(true)}
            type="button"
          >
            <Plus className="h-4 w-4" />
            New Announcement
          </button>
        ) : null}
      </div>

      <div className="grid max-w-3xl grid-cols-1 gap-4">
        {loading ? (
          <p className="py-16 text-center text-sm text-[#667085] dark:text-[#7d8299]">
            Loading announcements...
          </p>
        ) : sorted.length === 0 ? (
          <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-black/10 bg-white/60 p-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <Megaphone className="h-6 w-6 text-[#667085] dark:text-[#7d8299]" />
            <p className="text-sm text-[#667085] dark:text-[#7d8299]">
              No announcements yet.
              {isOwner ? " Post one to reach the whole house." : ""}
            </p>
          </div>
        ) : (
          sorted.map((announcement) => (
            <div
              className={`rounded-2xl border bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:bg-[#171a28] ${
                announcement.pinned
                  ? "border-[var(--fylmico-accent)]/40"
                  : "border-black/[0.06] dark:border-white/[0.08]"
              }`}
              key={announcement.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(announcement.authorName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <strong className="truncate text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                        {announcement.authorName}
                      </strong>
                      {announcement.pinned ? (
                        <Pin className="h-3.5 w-3.5 text-[var(--fylmico-accent)]" />
                      ) : null}
                    </div>
                    <span className="text-xs text-[#667085] dark:text-[#7d8299]">
                      {formatRelativeTime(announcement.createdAt)}
                    </span>
                  </div>
                </div>

                {isOwner ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      className={`grid h-8 w-8 place-items-center rounded-lg ${
                        announcement.pinned
                          ? "bg-[var(--fylmico-accent)]/10 text-[var(--fylmico-accent)]"
                          : "text-[#667085] hover:bg-black/[0.04] dark:text-[#7d8299] dark:hover:bg-white/[0.06]"
                      }`}
                      onClick={() => handleTogglePin(announcement)}
                      title={announcement.pinned ? "Unpin" : "Pin to top"}
                      type="button"
                    >
                      <Pin className="h-4 w-4" />
                    </button>
                    <button
                      className="grid h-8 w-8 place-items-center rounded-lg text-[#667085] hover:bg-red-50 hover:text-red-600 dark:text-[#7d8299] dark:hover:bg-red-500/10"
                      onClick={() => handleDelete(announcement)}
                      title="Delete"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>

              <h2 className="mt-3 text-base font-bold text-[#11142c] dark:text-[#f1f2f8]">
                {announcement.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap text-[#3a3f57] dark:text-[#b4b8cc]">
                {announcement.body}
              </p>
            </div>
          ))
        )}
      </div>

      <NewAnnouncementDialog
        onCreate={handleCreate}
        onOpenChange={setCreateOpen}
        open={createOpen}
      />
    </div>
  );
}
