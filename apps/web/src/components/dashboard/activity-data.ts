export type ActivityItem = {
  id: string;
  memberId: string;
  name: string;
  text: string;
  time: string;
  icon: string;
};

export const activities: ActivityItem[] = [
  {
    id: "activity-1",
    memberId: "user-priya",
    name: "Priya",
    text: "uploaded 12 files to Beyond Frames",
    time: "2 minutes ago",
    icon: "F"
  },
  {
    id: "activity-2",
    memberId: "user-rahul",
    name: "Rahul",
    text: "updated the call sheet for Ad Campaign",
    time: "15 minutes ago",
    icon: "C"
  },
  {
    id: "activity-3",
    memberId: "user-ananya",
    name: "Ananya",
    text: "completed task Storyboard v2",
    time: "1 hour ago",
    icon: "T"
  },
  {
    id: "activity-4",
    memberId: "user-karan",
    name: "Karan",
    text: "added a new location to Wanderers",
    time: "2 hours ago",
    icon: "L"
  }
];
