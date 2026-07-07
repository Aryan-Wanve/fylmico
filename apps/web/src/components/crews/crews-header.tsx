import { Network, SlidersHorizontal, UserPlus } from "lucide-react";

export function CrewsHeader({ onInvite }: { onInvite: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black text-[#11142c]">Crews</h1>
        <p className="mt-1 text-[#5f667d]">
          Manage your team, roles, and availability across all productions.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03]"
          type="button"
        >
          <Network className="h-4 w-4" />
          View Org Chart
        </button>
        <button
          className="flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03]"
          type="button"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
        <button
          className="flex h-10 items-center gap-2 rounded-xl bg-[#654cff] px-4 text-sm font-bold text-white hover:bg-[#5a41ea]"
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
