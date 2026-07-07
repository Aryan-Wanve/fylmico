export type EventCategory =
  | "shoot"
  | "post-production"
  | "meeting"
  | "pre-production"
  | "delivery"
  | "other";

export const CATEGORY_ORDER: EventCategory[] = [
  "shoot",
  "post-production",
  "meeting",
  "pre-production",
  "delivery",
  "other"
];

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  shoot: "Shoot",
  "post-production": "Post-Production",
  meeting: "Meeting",
  "pre-production": "Pre-Production",
  delivery: "Delivery",
  other: "Other"
};

export const CATEGORY_STYLES: Record<
  EventCategory,
  { dot: string; chip: string }
> = {
  shoot: { dot: "bg-[#654cff]", chip: "bg-[#654cff]/10 text-[#4c3bd6]" },
  "post-production": {
    dot: "bg-[#16c784]",
    chip: "bg-[#16c784]/10 text-[#0f9d68]"
  },
  meeting: { dot: "bg-[#f97316]", chip: "bg-[#f97316]/10 text-[#c2570d]" },
  "pre-production": {
    dot: "bg-[#3b82f6]",
    chip: "bg-[#3b82f6]/10 text-[#1d4ed8]"
  },
  delivery: { dot: "bg-[#ef4444]", chip: "bg-[#ef4444]/10 text-[#b91c1c]" },
  other: { dot: "bg-[#8a90a3]", chip: "bg-[#8a90a3]/10 text-[#5f667d]" }
};

export type CalendarSource = {
  id: string;
  name: string;
  color: string;
};

export const calendarSources: CalendarSource[] = [
  { id: "cal-my-schedule", name: "My Schedule", color: "bg-[#654cff]" },
  { id: "cal-beyond-frames", name: "Beyond Frames", color: "bg-[#3b82f6]" },
  { id: "cal-ad-campaign", name: "Ad Campaign", color: "bg-[#f97316]" },
  {
    id: "cal-wanderers-documentary",
    name: "Wanderers Documentary",
    color: "bg-[#16c784]"
  }
];

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  category: EventCategory;
  calendarId: string;
};

export const calendarEvents: CalendarEvent[] = [
  {
    id: "event-1",
    title: "Location Recce",
    date: "2026-07-05",
    time: "10:00 AM",
    category: "pre-production",
    calendarId: "cal-wanderers-documentary"
  },
  {
    id: "event-2",
    title: "Shoot – Interview Scene",
    date: "2026-07-07",
    time: "9:00 AM",
    location: "Studio A",
    category: "shoot",
    calendarId: "cal-beyond-frames"
  },
  {
    id: "event-3",
    title: "Lighting Setup",
    date: "2026-07-07",
    time: "11:30 AM",
    location: "Stage 2",
    category: "shoot",
    calendarId: "cal-ad-campaign"
  },
  {
    id: "event-4",
    title: "Edit Review",
    date: "2026-07-08",
    time: "4:30 PM",
    location: "Edit Suite 1",
    category: "post-production",
    calendarId: "cal-my-schedule"
  },
  {
    id: "event-5",
    title: "Team Call",
    date: "2026-07-09",
    time: "2:00 PM",
    category: "meeting",
    calendarId: "cal-my-schedule"
  },
  {
    id: "event-6",
    title: "Storyboard Review",
    date: "2026-07-11",
    time: "1:00 PM",
    location: "Online",
    category: "pre-production",
    calendarId: "cal-wanderers-documentary"
  },
  {
    id: "event-7",
    title: "Final Cut Discussion",
    date: "2026-07-14",
    time: "3:00 PM",
    location: "Meeting Room",
    category: "meeting",
    calendarId: "cal-my-schedule"
  },
  {
    id: "event-8",
    title: "Location Permits",
    date: "2026-07-16",
    time: "12:00 PM",
    category: "pre-production",
    calendarId: "cal-wanderers-documentary"
  },
  {
    id: "event-9",
    title: "Sound Test",
    date: "2026-07-18",
    time: "10:00 AM",
    location: "Studio B",
    category: "pre-production",
    calendarId: "cal-beyond-frames"
  },
  {
    id: "event-10",
    title: "Client Review",
    date: "2026-07-20",
    time: "2:30 PM",
    location: "Meeting Room",
    category: "meeting",
    calendarId: "cal-ad-campaign"
  },
  {
    id: "event-11",
    title: "Props & Wardrobe",
    date: "2026-07-23",
    time: "11:00 AM",
    category: "pre-production",
    calendarId: "cal-beyond-frames"
  },
  {
    id: "event-12",
    title: "Rough Cut Delivery",
    date: "2026-07-26",
    time: "EOD",
    category: "delivery",
    calendarId: "cal-beyond-frames"
  },
  {
    id: "event-13",
    title: "VFX Update",
    date: "2026-07-29",
    time: "4:00 PM",
    location: "Online",
    category: "post-production",
    calendarId: "cal-wanderers-documentary"
  }
];
