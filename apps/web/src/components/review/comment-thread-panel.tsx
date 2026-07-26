"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CornerUpLeft,
  Pencil,
  Pin,
  Send,
  SmilePlus,
  Trash2,
  X
} from "lucide-react";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { toInitials } from "@/components/tasks/task-data";
import { formatRelativeTime } from "@/lib/relative-time";
import { MentionTextarea } from "@/components/comments/mention-textarea";
import {
  createDeliverableComment,
  deleteDeliverableComment,
  listDeliverableComments,
  pinDeliverableComment,
  reopenDeliverableComment,
  resolveDeliverableComment,
  toggleDeliverableCommentReaction,
  updateDeliverableComment
} from "@/services/base-workspace.service";
import type { Comment } from "@/types/base";
import { formatTimestamp } from "@/components/review/player/player-format";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "🎉", "😮", "👀"];

function timestampChip(comment: Comment) {
  if (comment.timestampSeconds == null) return null;
  return formatTimestamp(comment.timestampSeconds);
}

export function CommentThreadPanel({
  deliverableId,
  currentUserId,
  isManager,
  members,
  currentTimeSeconds,
  currentFrame,
  onSeek,
  onCommentsChange
}: {
  deliverableId: string;
  currentUserId: string;
  isManager: boolean;
  members: { id: string; name: string }[];
  currentTimeSeconds?: number;
  currentFrame?: number;
  onSeek?: (seconds: number) => void;
  onCommentsChange?: (comments: Comment[]) => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [draftMentions, setDraftMentions] = useState<string[]>([]);
  const [attachTimestamp, setAttachTimestamp] = useState(true);
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyMentions, setReplyMentions] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [actionError, setActionError] = useState("");

  function describeError(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }

  useEffect(() => {
    let cancelled = false;
    listDeliverableComments(deliverableId)
      .then((data) => {
        if (!cancelled) setComments(data);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [deliverableId]);

  useEffect(() => {
    onCommentsChange?.(comments);
  }, [comments, onCommentsChange]);

  function replaceComment(updated: Comment) {
    setComments((current) =>
      current.map((comment) => {
        if (comment.id === updated.id) return { ...comment, ...updated };
        if (comment.replies?.some((reply) => reply.id === updated.id)) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === updated.id ? { ...reply, ...updated } : reply
            )
          };
        }
        return comment;
      })
    );
  }

  function removeComment(id: string) {
    setComments((current) =>
      current
        .filter((comment) => comment.id !== id)
        .map((comment) => ({
          ...comment,
          replies: comment.replies?.filter((reply) => reply.id !== id)
        }))
    );
  }

  async function handlePostTopLevel() {
    if (!draft.trim()) return;
    setActionError("");
    setPosting(true);
    try {
      const comment = await createDeliverableComment(
        deliverableId,
        draft.trim(),
        attachTimestamp && currentTimeSeconds != null
          ? Math.round(currentTimeSeconds)
          : undefined,
        {
          frameNumber: attachTimestamp ? currentFrame : undefined,
          mentionedUserIds: draftMentions
        }
      );
      setComments((current) => [...current, { ...comment, replies: [] }]);
      setDraft("");
      setDraftMentions([]);
    } catch (error) {
      setActionError(describeError(error, "Could not post that comment."));
    } finally {
      setPosting(false);
    }
  }

  async function handlePostReply(parentId: string) {
    if (!replyDraft.trim()) return;
    setActionError("");
    setPosting(true);
    try {
      const comment = await createDeliverableComment(
        deliverableId,
        replyDraft.trim(),
        undefined,
        { parentId, mentionedUserIds: replyMentions }
      );
      setComments((current) =>
        current.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies ?? []), comment] }
            : c
        )
      );
      setReplyingTo(null);
      setReplyDraft("");
      setReplyMentions([]);
    } catch (error) {
      setActionError(describeError(error, "Could not post that reply."));
    } finally {
      setPosting(false);
    }
  }

  async function handleToggleResolve(comment: Comment) {
    setActionError("");
    try {
      const updated = comment.resolvedAt
        ? await reopenDeliverableComment(deliverableId, comment.id)
        : await resolveDeliverableComment(deliverableId, comment.id);
      replaceComment(updated);
    } catch (error) {
      setActionError(describeError(error, "Could not update that comment."));
    }
  }

  async function handleTogglePin(comment: Comment) {
    setActionError("");
    try {
      const updated = await pinDeliverableComment(deliverableId, comment.id);
      replaceComment(updated);
    } catch (error) {
      setActionError(describeError(error, "Could not update that comment."));
    }
  }

  async function handleReact(comment: Comment, emoji: string) {
    setActionError("");
    try {
      const updated = await toggleDeliverableCommentReaction(
        deliverableId,
        comment.id,
        emoji
      );
      replaceComment(updated);
    } catch (error) {
      setActionError(describeError(error, "Could not add that reaction."));
    }
  }

  async function handleSaveEdit(commentId: string) {
    if (!editDraft.trim()) return;
    setActionError("");
    try {
      const updated = await updateDeliverableComment(
        deliverableId,
        commentId,
        editDraft.trim()
      );
      replaceComment(updated);
      setEditingId(null);
      setEditDraft("");
    } catch (error) {
      setActionError(describeError(error, "Could not save that edit."));
    }
  }

  async function handleDelete(commentId: string) {
    if (!window.confirm("Delete this comment?")) return;
    setActionError("");
    try {
      await deleteDeliverableComment(deliverableId, commentId);
      removeComment(commentId);
    } catch (error) {
      setActionError(describeError(error, "Could not delete that comment."));
    }
  }

  function renderReactions(comment: Comment) {
    const groups = new Map<string, { count: number; reacted: boolean }>();
    for (const reaction of comment.reactions ?? []) {
      const entry = groups.get(reaction.emoji) ?? { count: 0, reacted: false };
      entry.count += 1;
      if (reaction.userId === currentUserId) entry.reacted = true;
      groups.set(reaction.emoji, entry);
    }
    if (groups.size === 0) return null;
    return (
      <div className="mt-1 flex flex-wrap gap-1">
        {[...groups.entries()].map(([emoji, { count, reacted }]) => (
          <button
            className={`rounded-full border px-1.5 py-0.5 text-[11px] ${
              reacted
                ? "border-[var(--fylmico-accent)]/40 bg-[var(--fylmico-accent)]/10 text-[var(--fylmico-accent)]"
                : "border-white/10 bg-white/5 text-white/70"
            }`}
            key={emoji}
            onClick={() => void handleReact(comment, emoji)}
            type="button"
          >
            {emoji} {count}
          </button>
        ))}
      </div>
    );
  }

  function renderComment(comment: Comment, isReply: boolean) {
    const isAuthor = comment.authorId === currentUserId;
    const isEditing = editingId === comment.id;
    const chip = timestampChip(comment);

    return (
      <div
        className={`grid gap-1.5 ${isReply ? "ml-8 border-l border-white/10 pl-3" : ""}`}
        key={comment.id}
      >
        <div className="flex items-start gap-2.5">
          <AvatarWithStatus
            label={toInitials(comment.authorName)}
            size="sm"
            userId={comment.authorId}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-xs font-bold text-white">
                {comment.authorName}
              </strong>
              {chip ? (
                <button
                  className="rounded-md bg-[var(--fylmico-accent)]/15 px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#a996ff] hover:bg-[var(--fylmico-accent)]/25"
                  onClick={() => onSeek?.(comment.timestampSeconds ?? 0)}
                  type="button"
                >
                  {chip}
                </button>
              ) : null}
              {comment.pinned ? (
                <Pin className="h-3 w-3 text-amber-400" />
              ) : null}
              <span className="text-[11px] text-white/40">
                {formatRelativeTime(comment.createdAt)}
              </span>
              {comment.resolvedAt ? (
                <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  Resolved
                </span>
              ) : null}
            </div>

            {isEditing ? (
              <div className="mt-1 flex items-center gap-1.5">
                <input
                  className="h-8 flex-1 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white outline-none focus:border-[var(--fylmico-accent)]"
                  onChange={(event) => setEditDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void handleSaveEdit(comment.id);
                  }}
                  value={editDraft}
                />
                <button
                  aria-label="Save"
                  className="grid h-7 w-7 place-items-center rounded-lg text-emerald-400 hover:bg-white/10"
                  onClick={() => void handleSaveEdit(comment.id)}
                  type="button"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  aria-label="Cancel"
                  className="grid h-7 w-7 place-items-center rounded-lg text-white/50 hover:bg-white/10"
                  onClick={() => setEditingId(null)}
                  type="button"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <p className="mt-0.5 text-xs whitespace-pre-wrap text-white/80">
                {comment.body}
              </p>
            )}

            {renderReactions(comment)}

            <div className="mt-1 flex items-center gap-2.5 text-[11px] text-white/40">
              <div className="group relative">
                <button
                  className="flex items-center gap-1 hover:text-white"
                  type="button"
                >
                  <SmilePlus className="h-3 w-3" />
                  React
                </button>
                <div className="absolute bottom-full left-0 z-10 mb-1 hidden gap-0.5 rounded-lg border border-white/10 bg-[#171a28] p-1 group-hover:flex">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      className="rounded p-1 text-sm hover:bg-white/10"
                      key={emoji}
                      onClick={() => void handleReact(comment, emoji)}
                      type="button"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              {!isReply ? (
                <button
                  className="flex items-center gap-1 hover:text-white"
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                  type="button"
                >
                  <CornerUpLeft className="h-3 w-3" />
                  Reply
                </button>
              ) : null}
              <button
                className="hover:text-white"
                onClick={() => void handleToggleResolve(comment)}
                type="button"
              >
                {comment.resolvedAt ? "Reopen" : "Resolve"}
              </button>
              {isManager ? (
                <button
                  className="hover:text-white"
                  onClick={() => void handleTogglePin(comment)}
                  type="button"
                >
                  {comment.pinned ? "Unpin" : "Pin"}
                </button>
              ) : null}
              {isAuthor ? (
                <button
                  className="flex items-center gap-1 hover:text-white"
                  onClick={() => {
                    setEditingId(comment.id);
                    setEditDraft(comment.body);
                  }}
                  type="button"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              ) : null}
              {isAuthor ? (
                <button
                  className="flex items-center gap-1 text-red-400 hover:text-red-300"
                  onClick={() => void handleDelete(comment.id)}
                  type="button"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              ) : null}
            </div>

            {replyingTo === comment.id ? (
              <div className="mt-2 flex items-end gap-1.5">
                <MentionTextarea
                  candidates={members}
                  className="min-h-8 flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white outline-none focus:border-[var(--fylmico-accent)]"
                  mentionedUserIds={replyMentions}
                  onChange={setReplyDraft}
                  onMentionedUserIdsChange={setReplyMentions}
                  placeholder={`Reply... @mention with "@"`}
                  rows={1}
                  value={replyDraft}
                />
                <button
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--fylmico-accent)] text-white hover:bg-[var(--fylmico-accent-strong)] disabled:opacity-50"
                  disabled={posting || !replyDraft.trim()}
                  onClick={() => void handlePostReply(comment.id)}
                  type="button"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {comment.replies?.map((reply) => renderComment(reply, true))}
      </div>
    );
  }

  return (
    <div className="grid min-h-0 grid-rows-[1fr_auto] gap-3 rounded-2xl border border-white/10 bg-[#171a28] p-3">
      <div className="grid min-h-0 gap-4 overflow-y-auto pr-1">
        {loading ? (
          <p className="py-8 text-center text-xs text-white/40">
            Loading comments...
          </p>
        ) : comments.length === 0 ? (
          <p className="py-8 text-center text-xs text-white/40">
            No comments yet. Pause and add feedback at any point in the video.
          </p>
        ) : (
          comments.map((comment) => renderComment(comment, false))
        )}
      </div>

      <div className="grid gap-1.5 border-t border-white/10 pt-3">
        {actionError ? (
          <p className="text-[11px] font-semibold text-red-400">
            {actionError}
          </p>
        ) : null}
        {currentTimeSeconds != null ? (
          <label className="flex w-fit items-center gap-1.5 text-[11px] text-white/60">
            <input
              checked={attachTimestamp}
              onChange={(event) => setAttachTimestamp(event.target.checked)}
              type="checkbox"
            />
            Attach timestamp {formatTimestamp(currentTimeSeconds)}
          </label>
        ) : null}
        <div className="flex items-end gap-1.5">
          <MentionTextarea
            candidates={members}
            className="min-h-9 flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white outline-none focus:border-[var(--fylmico-accent)]"
            mentionedUserIds={draftMentions}
            onChange={setDraft}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handlePostTopLevel();
              }
            }}
            onMentionedUserIdsChange={setDraftMentions}
            placeholder={`Leave feedback... type "@" to mention`}
            rows={2}
            value={draft}
          />
          <button
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--fylmico-accent)] text-white hover:bg-[var(--fylmico-accent-strong)] disabled:opacity-50"
            disabled={posting || !draft.trim()}
            onClick={() => void handlePostTopLevel()}
            type="button"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
