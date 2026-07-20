import { MessageSquare } from "lucide-react";

export function MessagesEmptyState() {
  return (
    <div className="fylmico-content-in grid h-full min-h-[20rem] place-items-center gap-3 rounded-2xl border border-dashed border-black/10 bg-white/60 text-center dark:border-white/10 dark:bg-white/[0.02]">
      <div className="grid justify-items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--fylmico-accent)]/10 text-[var(--fylmico-accent)]">
          <MessageSquare className="h-6 w-6" />
        </div>
        <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          Select a chat to get started
        </strong>
        <p className="max-w-xs text-sm text-[#667085] dark:text-[#878ca0]">
          Choose a conversation from the list or start a new chat.
        </p>
      </div>
    </div>
  );
}
