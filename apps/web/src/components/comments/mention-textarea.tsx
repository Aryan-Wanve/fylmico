"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";

export interface MentionCandidate {
  id: string;
  name: string;
}

// Shared "@" mention composer: detects an active "@partial" token at the
// caret, offers a filtered dropdown of candidates, and on selection
// inserts "@Name " while tracking the picked user id separately so the
// caller can send it to the backend as `mentionedUserIds` (rather than
// re-parsing the body text for names, which breaks on duplicate/partial
// name matches).
export function MentionTextarea({
  value,
  onChange,
  mentionedUserIds,
  onMentionedUserIdsChange,
  candidates,
  placeholder,
  className,
  onKeyDown,
  rows = 2
}: {
  value: string;
  onChange: (value: string) => void;
  mentionedUserIds: string[];
  onMentionedUserIdsChange: (ids: string[]) => void;
  candidates: MentionCandidate[];
  placeholder?: string;
  className?: string;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [triggerIndex, setTriggerIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (query === null) return [];
    const term = query.toLowerCase();
    return candidates
      .filter((candidate) => candidate.name.toLowerCase().includes(term))
      .slice(0, 6);
  }, [query, candidates]);

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = event.target.value;
    onChange(next);

    const cursor = event.target.selectionStart ?? next.length;
    const upToCursor = next.slice(0, cursor);
    const atIndex = upToCursor.lastIndexOf("@");
    if (atIndex === -1) {
      setQuery(null);
      setTriggerIndex(null);
      return;
    }
    const afterAt = upToCursor.slice(atIndex + 1);
    if (/\s/.test(afterAt)) {
      setQuery(null);
      setTriggerIndex(null);
      return;
    }
    setQuery(afterAt);
    setTriggerIndex(atIndex);
  }

  function selectCandidate(candidate: MentionCandidate) {
    if (triggerIndex === null) return;
    const textarea = textareaRef.current;
    const cursor = textarea?.selectionStart ?? value.length;
    const before = value.slice(0, triggerIndex);
    const after = value.slice(cursor);
    const next = `${before}@${candidate.name} ${after}`;
    onChange(next);
    if (!mentionedUserIds.includes(candidate.id)) {
      onMentionedUserIdsChange([...mentionedUserIds, candidate.id]);
    }
    setQuery(null);
    setTriggerIndex(null);
    requestAnimationFrame(() => {
      const pos = before.length + candidate.name.length + 2;
      textarea?.setSelectionRange(pos, pos);
      textarea?.focus();
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      query !== null &&
      filtered.length > 0 &&
      (event.key === "Enter" || event.key === "Tab")
    ) {
      event.preventDefault();
      selectCandidate(filtered[0]);
      return;
    }
    if (event.key === "Escape" && query !== null) {
      setQuery(null);
      setTriggerIndex(null);
      return;
    }
    onKeyDown?.(event);
  }

  return (
    <div className="relative min-w-0 flex-1">
      <textarea
        className={className}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        ref={textareaRef}
        rows={rows}
        value={value}
      />
      {query !== null && filtered.length > 0 ? (
        <div className="absolute bottom-full left-0 z-20 mb-1 w-48 overflow-hidden rounded-lg border border-black/10 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#171a28]">
          {filtered.map((candidate) => (
            <button
              className="flex w-full items-center px-3 py-1.5 text-left text-xs text-[#11142c] hover:bg-black/[0.04] dark:text-[#f1f2f8] dark:hover:bg-white/[0.06]"
              key={candidate.id}
              onClick={() => selectCandidate(candidate)}
              type="button"
            >
              {candidate.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
