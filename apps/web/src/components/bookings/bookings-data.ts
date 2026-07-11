import type { BookingStatus, ResourceCategory } from "@/types/base";

export type { BookingStatus, ResourceCategory };

export const CATEGORY_STYLES: Record<
  ResourceCategory,
  { label: string; tile: string; icon: string; dot: string }
> = {
  studio: {
    label: "Studio",
    tile: "bg-[#3b82f6]/10 text-[#3b82f6]",
    icon: "bg-[#3b82f6]/10 text-[#2563eb]",
    dot: "bg-[#3b82f6]"
  },
  equipment: {
    label: "Equipment",
    tile: "bg-[#654cff]/10 text-[#654cff]",
    icon: "bg-[#654cff]/10 text-[#654cff]",
    dot: "bg-[#654cff]"
  },
  venue: {
    label: "Venue",
    tile: "bg-[#16c784]/10 text-[#16c784]",
    icon: "bg-[#16c784]/10 text-[#0f9d68]",
    dot: "bg-[#16c784]"
  }
};

export const STATUS_STYLES: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  confirmed: {
    label: "Confirmed",
    className: "bg-emerald-50 text-emerald-600"
  },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-600" },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-600" }
};

export function formatDateRange(startDate: string, endDate: string): string {
  const formatDay = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  const year = new Date(startDate).getFullYear();

  if (startDate === endDate) {
    return `${formatDay(startDate)}, ${year}`;
  }

  return `${formatDay(startDate)} – ${formatDay(endDate)}, ${year}`;
}
