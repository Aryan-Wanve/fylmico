export function CrewTableColumnHeader() {
  return (
    <div className="flex items-center gap-4 border-b border-black/5 px-4 py-2.5 text-xs font-bold tracking-wide text-[#8a90a3] uppercase dark:border-white/[0.06] dark:text-[#7d8299]">
      <span className="w-56 shrink-0 sm:w-64">Member</span>
      <span className="hidden w-40 shrink-0 md:block">Role</span>
      <span className="hidden w-40 shrink-0 lg:block">Department</span>
      <span className="w-24 shrink-0">Status</span>
      <span className="hidden min-w-0 flex-1 xl:block">Current Project</span>
      <span className="hidden w-36 shrink-0 xl:block">Availability</span>
      <span className="w-7 shrink-0" />
    </div>
  );
}
