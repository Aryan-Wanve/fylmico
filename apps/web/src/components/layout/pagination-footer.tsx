"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export function PaginationFooter({
  page,
  totalPages,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 25, 50]
}: {
  page: number;
  totalPages: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  perPageOptions?: number[];
}) {
  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 px-1">
      <div className="flex items-center gap-2 text-sm text-[#5f667d] dark:text-[#a8acbf]">
        Show
        <Select
          onValueChange={(next) => onPerPageChange(Number(next))}
          value={String(perPage)}
        >
          <SelectTrigger className="h-8 bg-white dark:bg-[#171a28]" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {perPageOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        per page
      </div>

      <div className="flex items-center gap-1">
        <button
          aria-label="Previous page"
          className="grid h-8 w-8 place-items-center rounded-lg text-[#8a90a3] hover:bg-black/[0.04] disabled:pointer-events-none disabled:opacity-40 dark:text-[#7d8299] dark:hover:bg-white/[0.06]"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageNumbers.map((entry, index) =>
          entry === "ellipsis" ? (
            <span
              className="px-1 text-sm text-[#8a90a3] dark:text-[#7d8299]"
              key={`ellipsis-${index}`}
            >
              …
            </span>
          ) : (
            <button
              className={`grid h-8 w-8 place-items-center rounded-lg text-sm font-semibold ${
                entry === page
                  ? "bg-[#654cff] text-white"
                  : "text-[#4b5268] hover:bg-black/[0.04] dark:text-[#c7cad9] dark:hover:bg-white/[0.06]"
              }`}
              key={entry}
              onClick={() => onPageChange(entry)}
              type="button"
            >
              {entry}
            </button>
          )
        )}
        <button
          aria-label="Next page"
          className="grid h-8 w-8 place-items-center rounded-lg text-[#8a90a3] hover:bg-black/[0.04] disabled:pointer-events-none disabled:opacity-40 dark:text-[#7d8299] dark:hover:bg-white/[0.06]"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function buildPageNumbers(
  page: number,
  totalPages: number
): Array<number | "ellipsis"> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, 2, page - 1, page, page + 1, totalPages]);
  const sorted = Array.from(pages)
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  const result: Array<number | "ellipsis"> = [];

  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) {
      result.push("ellipsis");
    }
    result.push(value);
  });

  return result;
}
