import { UserPlus } from "lucide-react";

export function CrewsHeader({ onInvite }: { onInvite: () => void }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-black text-[#11142c] sm:text-3xl dark:text-[#f1f2f8]">
          Crews
        </h1>
        <p className="mt-1 text-sm text-[#5f667d] sm:text-base dark:text-[#a8acbf]">
          Manage your team, roles, and availability across all productions.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          className="flex h-10 items-center gap-2 rounded-xl bg-[var(--fylmico-accent)] px-4 text-sm font-bold text-white hover:bg-[var(--fylmico-accent-strong)]"
          onClick={onInvite}
          type="button"
        >
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      </div>
    </div>
  );
}
