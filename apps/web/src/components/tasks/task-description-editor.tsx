"use client";

import { useRef, useState } from "react";
import { Bold, Italic, Link as LinkIcon, List } from "lucide-react";
import { renderMarkdownLite } from "@/components/tasks/task-data";

const buttonClassName =
  "grid h-7 w-7 place-items-center rounded-md border border-black/10 text-[#4b5268] hover:bg-black/[0.04] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.06]";

export function TaskDescriptionEditor({
  value,
  onChange
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function wrapSelection(prefix: string, suffix = prefix) {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    const { selectionStart, selectionEnd } = textarea;
    const selected = value.slice(selectionStart, selectionEnd) || "text";
    const next =
      value.slice(0, selectionStart) +
      prefix +
      selected +
      suffix +
      value.slice(selectionEnd);

    onChange(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        selectionStart + prefix.length,
        selectionStart + prefix.length + selected.length
      );
    });
  }

  function insertListItem() {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    const cursor = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", cursor - 1) + 1;
    const next = `${value.slice(0, lineStart)}- ${value.slice(lineStart)}`;

    onChange(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor + 2, cursor + 2);
    });
  }

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center gap-1.5 border-b border-black/5 pb-2 dark:border-white/[0.06]">
        <button
          className={buttonClassName}
          onClick={() => wrapSelection("**")}
          title="Bold"
          type="button"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          className={buttonClassName}
          onClick={() => wrapSelection("*")}
          title="Italic"
          type="button"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          className={buttonClassName}
          onClick={insertListItem}
          title="Bullet list"
          type="button"
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <button
          className={buttonClassName}
          onClick={() => wrapSelection("[", "](url)")}
          title="Link"
          type="button"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </button>
        <button
          className="ml-auto text-xs font-bold text-[#654cff]"
          onClick={() => setPreview((current) => !current)}
          type="button"
        >
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview ? (
        <div
          className="min-h-24 rounded-lg border border-black/10 p-3 text-sm leading-relaxed text-[#11142c] dark:border-white/10 dark:text-[#f1f2f8] [&_a]:text-[#654cff]"
          dangerouslySetInnerHTML={{ __html: renderMarkdownLite(value) }}
        />
      ) : (
        <textarea
          className="min-h-24 w-full resize-none rounded-lg border border-black/10 bg-transparent p-3 text-sm leading-relaxed text-[#11142c] outline-none focus:border-[#654cff] dark:border-white/10 dark:text-[#f1f2f8]"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Add a description... supports **bold**, *italic*, - lists, [links](url)"
          ref={textareaRef}
          value={value}
        />
      )}
    </div>
  );
}
