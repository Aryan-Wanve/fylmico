"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { toInitials } from "@/components/tasks/task-data";
import { formatRelativeTime } from "@/lib/relative-time";
import {
  createDeliverableComment,
  listDeliverableComments
} from "@/services/base-workspace.service";
import type { Comment, Deliverable, DeliverableStatus } from "@/types/base";

const STATUS_BADGES: Record<DeliverableStatus, string> = {
  draft:
    "bg-black/[0.04] text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]",
  review: "bg-amber-50 text-amber-600",
  revision: "bg-red-50 text-red-600",
  approved: "bg-emerald-50 text-emerald-600",
  rejected: "bg-red-100 text-red-700"
};

const STATUS_LABELS: Record<DeliverableStatus, string> = {
  draft: "Draft",
  review: "In Review",
  revision: "Revision Requested",
  approved: "Approved & Delivered",
  rejected: "Rejected"
};

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DeliverableRow({
  deliverable,
  onApprove,
  onRequestRevision
}: {
  deliverable: Deliverable;
  onApprove: () => Promise<void>;
  onRequestRevision: () => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggleExpanded() {
    const next = !expanded;
    setExpanded(next);
    if (next && !commentsLoaded) {
      const data = await listDeliverableComments(deliverable.id);
      setComments(data);
      setCommentsLoaded(true);
    }
  }

  async function handlePostComment() {
    if (!draft.trim()) return;
    setPosting(true);
    try {
      const comment = await createDeliverableComment(
        deliverable.id,
        draft.trim()
      );
      setComments((current) => [...current, comment]);
      setDraft("");
    } finally {
      setPosting(false);
    }
  }

  async function wrap(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-b border-black/5 last:border-b-0 dark:border-white/[0.06]">
      <div className="flex items-center gap-4 px-4 py-3">
        <FileText className="h-4 w-4 shrink-0 text-[var(--fylmico-accent)]" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <strong className="text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
              v{deliverable.version}
            </strong>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-bold ${STATUS_BADGES[deliverable.status]}`}
            >
              {STATUS_LABELS[deliverable.status]}
            </span>
          </div>
          <span className="text-xs text-[#667085] dark:text-[#7d8299]">
            {deliverable.file.name}
            {deliverable.file.size
              ? ` • ${formatSize(deliverable.file.size)}`
              : ""}{" "}
            • {deliverable.createdByName}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {deliverable.status === "review" ? (
            <>
              <Button
                className="h-8 rounded-lg bg-emerald-500 px-3 text-xs font-bold text-white hover:bg-emerald-600"
                disabled={busy}
                onClick={() => void wrap(onApprove)}
              >
                Approve
              </Button>
              <Button
                className="h-8 rounded-lg border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-500/30"
                disabled={busy}
                onClick={() => void wrap(onRequestRevision)}
                variant="outline"
              >
                Request Revision
              </Button>
            </>
          ) : null}
          <button
            className="grid h-8 w-8 place-items-center rounded-lg text-[#667085] hover:bg-black/[0.03] dark:text-[#7d8299] dark:hover:bg-white/[0.05]"
            onClick={() => void toggleExpanded()}
            type="button"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="grid gap-3 border-t border-black/5 bg-black/[0.015] px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
          {deliverable.notes ? (
            <p className="text-sm text-[#5f667d] dark:text-[#a8acbf]">
              {deliverable.notes}
            </p>
          ) : null}
          {comments.length === 0 ? (
            <p className="text-xs text-[#667085] dark:text-[#7d8299]">
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
                    <span className="text-xs text-[#667085] dark:text-[#7d8299]">
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
              className="h-9 flex-1 rounded-lg border border-black/10 bg-transparent px-3 text-xs text-[#11142c] outline-none focus:border-[var(--fylmico-accent)] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handlePostComment();
                }
              }}
              placeholder="Leave feedback..."
              value={draft}
            />
            <Button
              className="h-9 rounded-lg bg-[var(--fylmico-accent)] px-3 text-white hover:bg-[var(--fylmico-accent-strong)]"
              disabled={posting || !draft.trim()}
              onClick={handlePostComment}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
