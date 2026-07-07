export type ScheduleItem = {
  time: string;
  title: string;
  project: string;
  place: string;
  tone: "violet" | "blue";
};

export const scheduleItems: ScheduleItem[] = [
  {
    time: "09:00 AM",
    title: "Shoot - Interview Scene",
    project: "Beyond Frames",
    place: "Studio A",
    tone: "violet"
  },
  {
    time: "11:30 AM",
    title: "Lighting Setup",
    project: "Ad Campaign",
    place: "Stage 2",
    tone: "blue"
  },
  {
    time: "01:30 PM",
    title: "Lunch Break",
    project: "Crew",
    place: "Cafe",
    tone: "violet"
  },
  {
    time: "02:30 PM",
    title: "Client Review",
    project: "Brand Film",
    place: "Meeting Room",
    tone: "blue"
  },
  {
    time: "04:30 PM",
    title: "Edit Review",
    project: "Documentary",
    place: "Edit Suite 1",
    tone: "violet"
  }
];
