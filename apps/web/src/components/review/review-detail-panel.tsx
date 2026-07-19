"use client";

import { useEffect, useState } from "react";
import { Download, Send } from "lucide-react";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { REVIEW_STATUS_META } from "@/components/review/review-item-card";
import { PRIORITY_META, toInitials } from "@/components/tasks/task-data";
import { formatRelativeTime } from "@/lib/relative-time";
import {
  createDeliverableComment,
  getFileDownloadUrl,
  listDeliverableComments,
  listDeliverables
} from "@/services/base-workspace.service";
import type { Comment, Deliverable, ReviewQueueItem } from "@/types/base";

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReviewDetailPanel({
  item,
  onOpenChange,
  onApprove,
  onRequestChanges,
  onReassign
}: {
  item: ReviewQueueItem;
  onOpenChange: (open: boolean) => void;
  onApprove: () => Promise<void>;
  onRequestChanges: () => void;
  onReassign: () => void;
}) {
  const [versions, setVersions] = useState<Deliverable[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [posting, setPosting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [compareId, setCompareId] = useState("");

  useEffect(() => {
    // Version history is only available for project-owned deliverables
    // today (listDeliverables is a project-scoped route) - client-owned
    // ones still get the full approve/reject/comment flow below, just not
    // this "other versions" sidebar.
    if (item.projectId) {
      listDeliverables(item.projectId)
        .then((all) =>
          setVersions(
            [...all]
              .filter((d) => d.taskId === item.taskId)
              .sort((a, b) => b.version - a.version)
          )
        )
        .catch(() => setVersions([]));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing the version sidebar for client-owned deliverables, not deriving render output
      setVersions([]);
    }
    listDeliverableComments(item.id)
      .then(setComments)
      .catch(() => setComments([]));
  }, [item.id, item.projectId, item.taskId]);

  async function handlePostComment() {
    if (!draft.trim()) return;
    setPosting(true);
    try {
      const parsedTimestamp = timestamp.trim() ? Number(timestamp) : undefined;
      const comment = await createDeliverableComment(
        item.id,
        draft.trim(),
        Number.isFinite(parsedTimestamp) ? parsedTimestamp : undefined
      );
      setComments((current) => [...current, comment]);
      setDraft("");
      setTimestamp("");
    } finally {
      setPosting(false);
    }
  }

  async function handleOpenInDrive(fileEntryId: string) {
    const url = await getFileDownloadUrl(fileEntryId);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function wrap(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  const compareVersion = versions.find((v) => v.id === compareId);
  const current = versions.find((v) => v.id === item.id) ?? null;

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item.taskTitle ?? item.file.name}</DialogTitle>
        </DialogHeader>

        <div className="grid max-h-[70vh] gap-5 overflow-y-auto pr-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-black/[0.04] px-2 py-0.5 text-xs font-bold text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]">
              v{item.version}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-bold ${REVIEW_STATUS_META[item.status].className}`}
            >
              {REVIEW_STATUS_META[item.status].label}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold text-white ${PRIORITY_META[item.priority].bar}`}
            >
              {PRIORITY_META[item.priority].label}
            </span>
            <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
              {item.projectTitle ?? "No project"}
              {item.clientName ? ` · ${item.clientName}` : ""}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <AvatarWithStatus
              label={toInitials(item.editorName)}
              size="sm"
              userId={item.editorId}
            />
            <div>
              <strong className="block text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                {item.editorName}
              </strong>
              <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                Submitted {formatRelativeTime(item.submittedAt)} ·{" "}
                {item.file.name} ({formatSize(item.file.size)})
              </span>
            </div>
          </div>

          {item.notes ? (
            <p className="rounded-lg bg-black/[0.03] p-3 text-sm text-[#4b5268] dark:bg-white/[0.04] dark:text-[#c7cad9]">
              {item.notes}
            </p>
          ) : null}

          {item.exportSettings &&
          Object.keys(item.exportSettings).length > 0 ? (
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-black/[0.06] p-3 text-xs sm:grid-cols-3 dark:border-white/[0.08]">
              {Object.entries(item.exportSettings).map(([key, value]) => (
                <div key={key}>
                  <span className="block text-[#8a90a3] dark:text-[#7d8299]">
                    {key}
                  </span>
                  <strong className="text-[#11142c] dark:text-[#f1f2f8]">
                    {value}
                  </strong>
                </div>
              ))}
            </div>
          ) : null}

          <Button
            className="w-fit"
            onClick={() => void handleOpenInDrive(item.file.id)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Download className="h-3.5 w-3.5" />
            Open in Drive
          </Button>

          <div className="grid gap-2">
            <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
              Version history ({versions.length})
            </strong>
            <div className="overflow-hidden rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
              {versions.map((version) => (
                <div
                  className="flex items-center gap-3 border-b border-black/5 px-3 py-2 last:border-b-0 dark:border-white/[0.06]"
                  key={version.id}
                >
                  <span className="w-8 shrink-0 text-xs font-bold text-[#4b5268] dark:text-[#c7cad9]">
                    v{version.version}
                  </span>
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold ${REVIEW_STATUS_META[version.status].className}`}
                  >
                    {REVIEW_STATUS_META[version.status].label}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs text-[#8a90a3] dark:text-[#7d8299]">
                    {version.createdByName} ·{" "}
                    {formatRelativeTime(version.createdAt)}
                  </span>
                  <button
                    className="shrink-0 text-xs font-bold text-[#654cff] hover:underline"
                    onClick={() => void handleOpenInDrive(version.file.id)}
                    type="button"
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>
          </div>

          {versions.length > 1 ? (
            <div className="grid gap-2">
              <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                Compare versions
              </strong>
              <Select
                onValueChange={(next) => setCompareId(next ?? "")}
                value={compareId}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Pick a version to compare..." />
                </SelectTrigger>
                <SelectContent>
                  {versions
                    .filter((v) => v.id !== item.id)
                    .map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        v{v.version} · {v.createdByName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {compareVersion && current ? (
                <div className="grid grid-cols-1 gap-3 rounded-lg border border-black/[0.06] p-3 text-xs sm:grid-cols-2 dark:border-white/[0.08]">
                  {[current, compareVersion].map((v) => (
                    <div className="grid gap-1" key={v.id}>
                      <strong className="text-[#11142c] dark:text-[#f1f2f8]">
                        v{v.version}
                      </strong>
                      <span className="text-[#8a90a3] dark:text-[#7d8299]">
                        {v.file.name}
                      </span>
                      <span className="text-[#8a90a3] dark:text-[#7d8299]">
                        {formatSize(v.file.size)}
                      </span>
                      <span className="text-[#8a90a3] dark:text-[#7d8299]">
                        {v.notes || "No notes"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-2">
            <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
              Comments
            </strong>
            {comments.length === 0 ? (
              <p className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                No comments yet.
              </p>
            ) : (
              comments.map((comment) => (
                <div className="flex items-start gap-2.5" key={comment.id}>
                  <AvatarWithStatus
                    label={toInitials(comment.authorName)}
                    size="sm"
                    userId={comment.authorId}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-[#11142c] dark:text-[#f1f2f8]">
                        {comment.authorName}
                      </strong>
                      {comment.timestampSeconds != null ? (
                        <span className="rounded-md bg-[#654cff]/10 px-1.5 py-0.5 text-xs font-bold text-[#654cff]">
                          {Math.floor(comment.timestampSeconds / 60)}:
                          {String(
                            Math.floor(comment.timestampSeconds % 60)
                          ).padStart(2, "0")}
                        </span>
                      ) : null}
                      <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#4b5268] dark:text-[#c7cad9]">
                      {comment.body}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div className="flex items-center gap-2">
              <input
                className="h-9 w-20 shrink-0 rounded-lg border border-black/10 bg-transparent px-2 text-xs text-[#11142c] outline-none focus:border-[#654cff] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
                onChange={(event) => setTimestamp(event.target.value)}
                placeholder="Sec."
                type="number"
                value={timestamp}
              />
              <input
                className="h-9 flex-1 rounded-lg border border-black/10 bg-transparent px-3 text-xs text-[#11142c] outline-none focus:border-[#654cff] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handlePostComment();
                  }
                }}
                placeholder="Leave feedback... (optional: seconds for timestamp)"
                value={draft}
              />
              <Button
                className="h-9 shrink-0"
                disabled={posting || !draft.trim()}
                onClick={() => void handlePostComment()}
                type="button"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-3">
          <Button
            disabled={busy}
            onClick={onReassign}
            type="button"
            variant="outline"
          >
            Reassign
          </Button>
          <Button
            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30"
            disabled={busy}
            onClick={onRequestChanges}
            type="button"
            variant="outline"
          >
            Request Changes
          </Button>
          <Button
            className="bg-emerald-500 text-white hover:bg-emerald-600"
            disabled={busy || item.status === "approved"}
            onClick={() => void wrap(onApprove)}
            type="button"
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
