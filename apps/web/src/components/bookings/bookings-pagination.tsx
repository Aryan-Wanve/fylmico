import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_NUMBERS = [1, 2, 3];

export function BookingsPagination({ rowCount }: { rowCount: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
      <span className="text-sm font-medium text-[#8a90a3]">
        Show <span className="font-bold text-[#3a3f57]">{rowCount}</span> per
        page
      </span>

      <div className="flex items-center gap-1.5">
        <button
          aria-label="Previous page"
          className="grid h-8 w-8 place-items-center rounded-lg border border-black/10 text-[#8a90a3] hover:bg-black/[0.03]"
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {PAGE_NUMBERS.map((page) => (
          <button
            className={`grid h-8 w-8 place-items-center rounded-lg text-sm font-bold ${
              page === 1
                ? "bg-[#654cff] text-white"
                : "text-[#5f667d] hover:bg-black/[0.03]"
            }`}
            key={page}
            type="button"
          >
            {page}
          </button>
        ))}
        <span className="px-1 text-sm font-semibold text-[#c3c7d4]">…</span>
        <button
          className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-[#5f667d] hover:bg-black/[0.03]"
          type="button"
        >
          10
        </button>
        <button
          aria-label="Next page"
          className="grid h-8 w-8 place-items-center rounded-lg border border-black/10 text-[#8a90a3] hover:bg-black/[0.03]"
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
