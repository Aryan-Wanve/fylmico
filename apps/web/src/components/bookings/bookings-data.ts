export type BookingStatus = "confirmed" | "pending" | "cancelled";

export type ResourceCategory = "studio" | "equipment" | "venue";

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

export type BookingRow = {
  id: string;
  resourceName: string;
  resourceSubtitle: string;
  resourceCategory: ResourceCategory;
  resourceTag: string;
  projectName: string;
  projectPhase: string;
  dateRange: string;
  timeRange: string;
  status: BookingStatus;
  bookedByUserId: string;
  bookedByName: string;
  bookedAgo: string;
};

export const bookingRows: BookingRow[] = [
  {
    id: "booking-1",
    resourceName: "Studio A",
    resourceSubtitle: "Fylmico Studios, Mumbai",
    resourceCategory: "studio",
    resourceTag: "1200 sq ft",
    projectName: "Beyond Frames",
    projectPhase: "Pre-Production",
    dateRange: "Jul 10 – Jul 12, 2026",
    timeRange: "9:00 AM – 6:00 PM",
    status: "confirmed",
    bookedByUserId: "user-priya",
    bookedByName: "Priya S.",
    bookedAgo: "2 days ago"
  },
  {
    id: "booking-2",
    resourceName: "ARRI Alexa Mini LF",
    resourceSubtitle: "Camera Package",
    resourceCategory: "equipment",
    resourceTag: "Camera",
    projectName: "LUMEE Ad Campaign",
    projectPhase: "Production",
    dateRange: "Jul 8 – Jul 15, 2026",
    timeRange: "9:00 AM – 7:00 PM",
    status: "confirmed",
    bookedByUserId: "user-rahul",
    bookedByName: "Rahul K.",
    bookedAgo: "3 days ago"
  },
  {
    id: "booking-3",
    resourceName: "DJI Ronin 4D",
    resourceSubtitle: "Gimbal Stabilizer",
    resourceCategory: "equipment",
    resourceTag: "Stabilizer",
    projectName: "Echoes",
    projectPhase: "Post-Production",
    dateRange: "Jul 5 – Jul 7, 2026",
    timeRange: "10:00 AM – 6:00 PM",
    status: "pending",
    bookedByUserId: "user-vikram",
    bookedByName: "Vikram J.",
    bookedAgo: "Yesterday"
  },
  {
    id: "booking-4",
    resourceName: "Conference Room 1",
    resourceSubtitle: "Fylmico Offices",
    resourceCategory: "venue",
    resourceTag: "10 Seats",
    projectName: "Ad Campaign",
    projectPhase: "Production",
    dateRange: "Jul 7, 2026",
    timeRange: "11:00 AM – 1:00 PM",
    status: "confirmed",
    bookedByUserId: "user-ananya",
    bookedByName: "Ananya R.",
    bookedAgo: "5 days ago"
  },
  {
    id: "booking-5",
    resourceName: "LED Wall (10x6 ft)",
    resourceSubtitle: "Visual Equipment",
    resourceCategory: "equipment",
    resourceTag: "Lighting",
    projectName: "Wanderers",
    projectPhase: "Pre-Production",
    dateRange: "Jul 14 – Jul 16, 2026",
    timeRange: "9:00 AM – 6:00 PM",
    status: "pending",
    bookedByUserId: "user-karan",
    bookedByName: "Karan M.",
    bookedAgo: "5 days ago"
  },
  {
    id: "booking-6",
    resourceName: "Makeup Room",
    resourceSubtitle: "Fylmico Studios, Mumbai",
    resourceCategory: "venue",
    resourceTag: "1 Room",
    projectName: "Beyond Frames",
    projectPhase: "Pre-Production",
    dateRange: "Jul 10 – Jul 12, 2026",
    timeRange: "9:00 AM – 6:00 PM",
    status: "confirmed",
    bookedByUserId: "user-priya",
    bookedByName: "Priya S.",
    bookedAgo: "1 week ago"
  },
  {
    id: "booking-7",
    resourceName: "Zoom H6 Recorder",
    resourceSubtitle: "Audio Recorder",
    resourceCategory: "equipment",
    resourceTag: "Audio",
    projectName: "Documentary",
    projectPhase: "Production",
    dateRange: "Jul 3 – Jul 5, 2026",
    timeRange: "9:00 AM – 5:00 PM",
    status: "cancelled",
    bookedByUserId: "user-rahul",
    bookedByName: "Rahul K.",
    bookedAgo: "1 week ago"
  },
  {
    id: "booking-8",
    resourceName: "Editing Suite 2",
    resourceSubtitle: "Fylmico Studios, Mumbai",
    resourceCategory: "venue",
    resourceTag: "1 Room",
    projectName: "Echoes",
    projectPhase: "Post-Production",
    dateRange: "Jul 16 – Jul 18, 2026",
    timeRange: "10:00 AM – 6:00 PM",
    status: "confirmed",
    bookedByUserId: "user-aryan",
    bookedByName: "Aryan W.",
    bookedAgo: "3 days ago"
  },
  {
    id: "booking-9",
    resourceName: "Sony A7S III",
    resourceSubtitle: "Camera Package",
    resourceCategory: "equipment",
    resourceTag: "Camera",
    projectName: "Wanderers",
    projectPhase: "Pre-Production",
    dateRange: "Jul 20 – Jul 22, 2026",
    timeRange: "9:00 AM – 6:00 PM",
    status: "pending",
    bookedByUserId: "user-aryan",
    bookedByName: "Aryan W.",
    bookedAgo: "6 hours ago"
  },
  {
    id: "booking-10",
    resourceName: "Green Screen Studio",
    resourceSubtitle: "Fylmico Studios, Mumbai",
    resourceCategory: "studio",
    resourceTag: "900 sq ft",
    projectName: "LUMEE Ad Campaign",
    projectPhase: "Production",
    dateRange: "Jul 18 – Jul 19, 2026",
    timeRange: "9:00 AM – 4:00 PM",
    status: "confirmed",
    bookedByUserId: "user-ananya",
    bookedByName: "Ananya R.",
    bookedAgo: "2 weeks ago"
  }
];

export type BookingsStat = {
  id: string;
  title: string;
  value: string;
  note: string;
  tone: "violet" | "blue" | "green" | "orange";
  sparklinePoints?: number[];
};

export const bookingsStats: BookingsStat[] = [
  {
    id: "total",
    title: "Total Bookings",
    value: "27",
    note: "+12 this month",
    tone: "violet",
    sparklinePoints: [14, 16, 15, 18, 20, 22, 24, 27]
  },
  {
    id: "upcoming",
    title: "Upcoming",
    value: "15",
    note: "Next 30 days",
    tone: "blue",
    sparklinePoints: [9, 10, 9, 11, 12, 13, 14, 15]
  },
  {
    id: "confirmed",
    title: "Confirmed",
    value: "18",
    note: "66% of total",
    tone: "green",
    sparklinePoints: [10, 11, 12, 13, 14, 16, 17, 18]
  },
  {
    id: "pending",
    title: "Pending Approval",
    value: "3",
    note: "Needs action",
    tone: "orange"
  }
];

export const bookingsByType: {
  label: string;
  value: number;
  percentage: number;
  color: string;
}[] = [
  { label: "Equipment", value: 12, percentage: 44, color: "#654cff" },
  { label: "Studios", value: 7, percentage: 26, color: "#3b82f6" },
  { label: "Venues", value: 5, percentage: 19, color: "#16c784" },
  { label: "Services", value: 3, percentage: 11, color: "#f97316" }
];

export const bookingsByTypeTotal = bookingsByType.reduce(
  (sum, segment) => sum + segment.value,
  0
);

export type UpcomingBooking = {
  id: string;
  resourceName: string;
  projectName: string;
  resourceCategory: ResourceCategory;
  day: string;
  month: string;
};

export const upcomingBookings: UpcomingBooking[] = [
  {
    id: "upcoming-1",
    resourceName: "Studio A",
    projectName: "Beyond Frames",
    resourceCategory: "studio",
    day: "10",
    month: "JUL"
  },
  {
    id: "upcoming-2",
    resourceName: "ARRI Alexa Mini LF",
    projectName: "LUMEE Ad Campaign",
    resourceCategory: "equipment",
    day: "08",
    month: "JUL"
  },
  {
    id: "upcoming-3",
    resourceName: "Conference Room 1",
    projectName: "Ad Campaign",
    resourceCategory: "venue",
    day: "07",
    month: "JUL"
  },
  {
    id: "upcoming-4",
    resourceName: "LED Wall (10x6 ft)",
    projectName: "Wanderers",
    resourceCategory: "equipment",
    day: "14",
    month: "JUL"
  }
];

export const tabCounts = {
  myBookings: 8,
  pendingApproval: 3
};
