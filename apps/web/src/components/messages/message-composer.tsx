"use client";

import { useRef, useState } from "react";
import { Paperclip, Send, X } from "lucide-react";
import { uploadFileEntry } from "@/services/base-workspace.service";

export function MessageComposer({
  onSend,
  roomId,
  replyingToName,
  onCancelReply,
  onTyping
}: {
  onSend: (body: string) => void;
  roomId: string;
  replyingToName?: string;
  onCancelReply?: () => void;
  onTyping?: () => void;
}) {
  const [value, setValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    onSend(trimmed);
    setValue("");
  }

  async function handleFileSelected(file: File) {
    setUploading(true);
    try {
      const entry = await uploadFileEntry(file, null, roomId);
      onSend(`📎 ${entry.name}`);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not attach the file."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/[0.06] p-3 dark:border-white/[0.08]">
      {replyingToName ? (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-black/[0.03] px-2.5 py-1.5 text-xs font-semibold text-[#5f667d] dark:bg-white/[0.05] dark:text-[#a8acbf]">
          <span>Replying to {replyingToName}</span>
          <button
            aria-label="Cancel reply"
            className="grid h-5 w-5 place-items-center rounded-full hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
            onClick={onCancelReply}
            type="button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
      <textarea
        className="min-h-[2.75rem] w-full resize-none bg-transparent text-sm text-[#12142b] outline-none placeholder:text-[#9296a4] dark:text-[#f1f2f8] dark:placeholder:text-[#7d8299]"
        onChange={(event) => {
          setValue(event.target.value);
          onTyping?.();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSend();
          }
        }}
        placeholder="Type a message..."
        rows={1}
        value={value}
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-[#8a90a3] dark:text-[#7d8299]">
          <input
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleFileSelected(file);
              }
              event.target.value = "";
            }}
            ref={fileInputRef}
            type="file"
          />
          <button
            aria-label="Attach file"
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-black/[0.04] disabled:opacity-40 dark:hover:bg-white/[0.06]"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <Paperclip className="h-4 w-4" />
          </button>
        </div>
        <button
          aria-label="Send message"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#654cff] text-white hover:bg-[#5a41ea] disabled:opacity-40"
          disabled={!value.trim()}
          onClick={handleSend}
          type="button"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
