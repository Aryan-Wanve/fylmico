"use client";

import { useState } from "react";
import { CornerUpLeft, Send, SmilePlus } from "lucide-react";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { formatRelativeTime } from "@/lib/relative-time";
import {
  addReviewComment,
  addReviewReply,
  toggleReviewReaction
} from "@/services/review-session-public.service";
import type { ReviewClientComment } from "@/types/base";
import { formatTimestamp } from "@/components/review/player/player-format";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "🎉", "😮", "👀"];

function initials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export function ClientCommentThread({
  token,
  comments,
  locked,
  currentTimeSeconds,
  onSeek,
  onCommentsChange
}: {
  token: string;
  comments: ReviewClientComment[];
  locked: boolean;
  currentTimeSeconds?: number;
  onSeek?: (seconds: number) => void;
  onCommentsChange: (comments: ReviewClientComment[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [attachTimestamp, setAttachTimestamp] = useState(true);
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [error, setError] = useState("");

  function describeError(err: unknown, fallback: string): string {
    return err instanceof Error ? err.message : fallback;
  }

  async function handlePostTopLevel() {
    if (!draft.trim()) return;
    setError("");
    setPosting(true);
    try {
      const comment = await addReviewComment(
        token,
        draft.trim(),
        attachTimestamp && currentTimeSeconds != null
          ? Math.round(currentTimeSeconds)
          : undefined
      );
      onCommentsChange([...comments, { ...comment, replies: [] }]);
      setDraft("");
    } catch (postError) {
      setError(describeError(postError, "Could not post that comment."));
    } finally {
      setPosting(false);
    }
  }

  async function handlePostReply(parentId: string) {
    if (!replyDraft.trim()) return;
    setError("");
    setPosting(true);
    try {
      const reply = await addReviewReply(token, parentId, replyDraft.trim());
      onCommentsChange(
        comments.map((comment) =>
          comment.id === parentId
            ? { ...comment, replies: [...comment.replies, reply] }
            : comment
        )
      );
      setReplyingTo(null);
      setReplyDraft("");
    } catch (postError) {
      setError(describeError(postError, "Could not post that reply."));
    } finally {
      setPosting(false);
    }
  }

  async function handleReact(comment: ReviewClientComment, emoji: string) {
    setError("");
    try {
      const updated = await toggleReviewReaction(token, comment.id, emoji);
      onCommentsChange(
        comments.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );
    } catch (reactError) {
      setError(describeError(reactError, "Could not add that reaction."));
    }
  }

  function renderReactions(comment: ReviewClientComment) {
    if (comment.reactions.length === 0) return null;
    return (
      <div className="mt-1 flex flex-wrap gap-1">
        {comment.reactions.map((reaction) => (
          <button
            className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-white/70"
            key={reaction.emoji}
            onClick={() => void handleReact(comment, reaction.emoji)}
            type="button"
          >
            {reaction.emoji} {reaction.count}
          </button>
        ))}
      </div>
    );
  }

  function renderComment(comment: ReviewClientComment, isReply: boolean) {
    const chip =
      comment.timestampSeconds != null
        ? formatTimestamp(comment.timestampSeconds)
        : null;

    return (
      <div
        className={`grid gap-1.5 ${isReply ? "ml-8 border-l border-white/10 pl-3" : ""}`}
        key={comment.id}
      >
        <div className="flex items-start gap-2.5">
          <AvatarWithStatus
            label={initials(comment.authorName)}
            size="sm"
            userId={comment.id}
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
              <span className="text-[11px] text-white/40">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>

            <p className="mt-0.5 text-xs whitespace-pre-wrap text-white/80">
              {comment.body}
            </p>

            {renderReactions(comment)}

            {!locked ? (
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
                      setReplyingTo(
                        replyingTo === comment.id ? null : comment.id
                      )
                    }
                    type="button"
                  >
                    <CornerUpLeft className="h-3 w-3" />
                    Reply
                  </button>
                ) : null}
              </div>
            ) : null}

            {replyingTo === comment.id ? (
              <div className="mt-2 flex items-end gap-1.5">
                <textarea
                  className="min-h-8 flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white outline-none focus:border-[var(--fylmico-accent)]"
                  onChange={(event) => setReplyDraft(event.target.value)}
                  placeholder="Reply..."
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

        {comment.replies.map((reply) => renderComment(reply, true))}
      </div>
    );
  }

  return (
    <div className="grid min-h-0 grid-rows-[1fr_auto] gap-3 rounded-2xl border border-white/10 bg-[#171a28] p-3">
      <div className="grid min-h-0 gap-4 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="py-8 text-center text-xs text-white/40">
            No comments yet. Pause and add feedback at any point in the video.
          </p>
        ) : (
          comments.map((comment) => renderComment(comment, false))
        )}
      </div>

      {!locked ? (
        <div className="grid gap-1.5 border-t border-white/10 pt-3">
          {error ? (
            <p className="text-[11px] font-semibold text-red-400">{error}</p>
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
            <textarea
              className="min-h-9 flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white outline-none focus:border-[var(--fylmico-accent)]"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handlePostTopLevel();
                }
              }}
              placeholder="Leave feedback..."
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
      ) : (
        <p className="border-t border-white/10 pt-3 text-center text-[11px] text-white/40">
          Comments are locked for this review link.
        </p>
      )}
    </div>
  );
}
