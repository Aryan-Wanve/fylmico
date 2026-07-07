import { toISODate } from "@/lib/calendar-utils";

export type TimelineShoot = {
  id: string;
  date: string;
  time: string;
  title: string;
  place: string;
  project: string;
  status: "In Progress" | "Scheduled";
};

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

export const timelineShoots: TimelineShoot[] = [
  {
    id: "shoot-today",
    date: toISODate(today),
    time: "09:00 AM",
    title: "Shoot - Interview Scene",
    place: "Studio A",
    project: "Beyond Frames",
    status: "In Progress"
  },
  {
    id: "shoot-tomorrow",
    date: toISODate(tomorrow),
    time: "11:00 AM",
    title: "Location Scout",
    place: "Riverside Park",
    project: "Wanderers",
    status: "Scheduled"
  }
];
