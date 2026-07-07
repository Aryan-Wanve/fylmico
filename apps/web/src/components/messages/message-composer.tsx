"use client";

import { useState } from "react";
import {
  AtSign,
  Bold,
  Italic,
  Link2,
  List,
  Paperclip,
  Send,
  Smile
} from "lucide-react";

export function MessageComposer({
  onSend
}: {
  onSend: (body: string) => void;
}) {
  const [value, setValue] = useState("");

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="rounded-2xl border border-black/[0.06] p-3">
      <textarea
        className="min-h-[2.75rem] w-full resize-none bg-transparent text-sm text-[#12142b] outline-none placeholder:text-[#9296a4]"
        onChange={(event) => setValue(event.target.value)}
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
        <div className="flex items-center gap-1 text-[#8a90a3]">
          <button
            aria-label="Attach file"
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-black/[0.04]"
            type="button"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <button
            aria-label="Add emoji"
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-black/[0.04]"
            type="button"
          >
            <Smile className="h-4 w-4" />
          </button>
          <button
            aria-label="Mention someone"
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-black/[0.04]"
            type="button"
          >
            <AtSign className="h-4 w-4" />
          </button>
          <button
            aria-label="Bold"
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-black/[0.04]"
            type="button"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            aria-label="Italic"
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-black/[0.04]"
            type="button"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            aria-label="Bulleted list"
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-black/[0.04]"
            type="button"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            aria-label="Insert link"
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-black/[0.04]"
            type="button"
          >
            <Link2 className="h-4 w-4" />
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
