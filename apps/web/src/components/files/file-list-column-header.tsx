export function FileListColumnHeader() {
  return (
    <div className="flex items-center gap-4 border-b border-black/5 px-4 py-2.5 text-xs font-bold tracking-wide text-[#667085] uppercase dark:border-white/[0.06] dark:text-[#878ca0]">
      <span className="min-w-0 flex-1">Name</span>
      <span className="hidden w-24 shrink-0 sm:block">Size</span>
      <span className="hidden w-24 shrink-0 md:block">Type</span>
      <span className="hidden w-36 shrink-0 lg:block">Modified</span>
      <span className="hidden w-32 shrink-0 xl:block">Modified By</span>
      <span className="w-7 shrink-0" />
    </div>
  );
}
