export type StatCardData = {
  id: string;
  title: string;
  value: string;
  note: string;
  tone: "violet" | "blue" | "green" | "orange";
  sparklinePoints: number[];
  viewAll?: boolean;
};

export const statCards: StatCardData[] = [
  {
    id: "total-projects",
    title: "Total Projects",
    value: "28",
    note: "+12% this month",
    tone: "violet",
    sparklinePoints: [18, 20, 19, 22, 24, 23, 26, 28]
  },
  {
    id: "active-projects",
    title: "Active Projects",
    value: "12",
    note: "+8% this month",
    tone: "blue",
    sparklinePoints: [8, 9, 8, 10, 11, 10, 12, 12]
  },
  {
    id: "tasks-completed",
    title: "Tasks Completed",
    value: "482",
    note: "+18% this month",
    tone: "green",
    sparklinePoints: [300, 320, 350, 380, 400, 430, 460, 482]
  },
  {
    id: "hours-logged",
    title: "Hours Logged",
    value: "1,248h",
    note: "+15% this month",
    tone: "orange",
    sparklinePoints: [900, 950, 1000, 1050, 1100, 1150, 1200, 1248]
  },
  {
    id: "team-efficiency",
    title: "Team Efficiency",
    value: "87%",
    note: "+6% this month",
    tone: "violet",
    sparklinePoints: [75, 78, 80, 79, 82, 84, 85, 87],
    viewAll: true
  }
];

export type ProjectProgressSeries = {
  id: string;
  label: string;
  color: string;
  points: number[];
};

export const projectProgressXLabels = [
  "Jul 1",
  "Jul 2",
  "Jul 3",
  "Jul 4",
  "Jul 5",
  "Jul 6",
  "Jul 7"
];

export const projectProgressSeries: ProjectProgressSeries[] = [
  {
    id: "beyond-frames",
    label: "Beyond Frames",
    color: "#654cff",
    points: [45, 52, 58, 62, 68, 72, 78]
  },
  {
    id: "lumea",
    label: "LUMEE Ad Campaign",
    color: "#3b82f6",
    points: [30, 35, 40, 45, 50, 55, 62]
  },
  {
    id: "echoes",
    label: "Echoes",
    color: "#16c784",
    points: [15, 18, 22, 28, 32, 36, 41]
  },
  {
    id: "wanderers",
    label: "Wanderers",
    color: "#f97316",
    points: [8, 10, 13, 16, 19, 22, 25]
  }
];

export type ChartSegment = {
  label: string;
  value: number;
  color: string;
};

export const taskStatusSegments: ChartSegment[] = [
  { label: "Completed", value: 242, color: "#16c784" },
  { label: "In Progress", value: 164, color: "#3b82f6" },
  { label: "To Do", value: 56, color: "#f97316" },
  { label: "Blocked", value: 20, color: "#ef4444" }
];

export const taskStatusTotal = taskStatusSegments.reduce(
  (sum, segment) => sum + segment.value,
  0
);

export const timeLoggedXLabels = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun"
];

export const timeLoggedPoints = [140, 165, 150, 186, 170, 160, 145];

export const timeLoggedTotalLabel = "1,248h";

export const timeDistributionSegments: ChartSegment[] = [
  { label: "Pre-Production", value: 436, color: "#3b82f6" },
  { label: "Production", value: 499, color: "#16c784" },
  { label: "Post-Production", value: 187, color: "#f97316" },
  { label: "Planning", value: 126, color: "#ef4444" }
];

export const timeDistributionTotal = timeDistributionSegments.reduce(
  (sum, segment) => sum + segment.value,
  0
);

export type TopProject = {
  id: string;
  title: string;
  image: string;
  progress: number;
  tone: "violet" | "blue" | "green" | "orange";
};

export const topActiveProjects: TopProject[] = [
  {
    id: "beyond-frames",
    title: "Beyond Frames",
    image: "/images/dashboard/project-beyond-frames.jpg",
    progress: 78,
    tone: "violet"
  },
  {
    id: "lumea",
    title: "LUMEE Ad Campaign",
    image: "/images/dashboard/project-lumea.jpg",
    progress: 62,
    tone: "blue"
  },
  {
    id: "echoes",
    title: "Echoes",
    image: "/images/dashboard/project-echoes.jpg",
    progress: 41,
    tone: "green"
  },
  {
    id: "wanderers",
    title: "Wanderers",
    image: "/images/dashboard/project-wanderers.jpg",
    progress: 25,
    tone: "orange"
  }
];

const HEATMAP_TIME_LABELS = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM"];

const HEATMAP_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const activityHeatmap = {
  dayLabels: HEATMAP_DAY_LABELS,
  timeLabels: HEATMAP_TIME_LABELS,
  // 0-4 intensity, one row per day, one value per time-of-day bucket.
  matrix: [
    [0, 1, 3, 4, 3, 1],
    [0, 1, 4, 4, 3, 2],
    [0, 2, 3, 4, 4, 2],
    [0, 1, 4, 4, 4, 2],
    [0, 2, 3, 4, 3, 3],
    [0, 0, 1, 2, 2, 1],
    [0, 0, 1, 1, 1, 0]
  ]
};

export type ContributorStat = {
  id: string;
  userId: string;
  name: string;
  hours: string;
};

export const topContributors: ContributorStat[] = [
  {
    id: "contrib-priya",
    userId: "user-priya",
    name: "Priya Shah",
    hours: "128h"
  },
  {
    id: "contrib-rahul",
    userId: "user-rahul",
    name: "Rahul Mehta",
    hours: "112h"
  },
  {
    id: "contrib-ananya",
    userId: "user-ananya",
    name: "Ananya Rao",
    hours: "98h"
  },
  {
    id: "contrib-karan",
    userId: "user-karan",
    name: "Karan Gill",
    hours: "86h"
  },
  {
    id: "contrib-aryan",
    userId: "user-aryan",
    name: "Aryan Wanve",
    hours: "72h"
  }
];

export type WorkloadStat = {
  id: string;
  userId: string;
  name: string;
  role: string;
  percentage: number;
};

export const teamWorkload: WorkloadStat[] = [
  {
    id: "workload-priya",
    userId: "user-priya",
    name: "Priya Shah",
    role: "Producer",
    percentage: 92
  },
  {
    id: "workload-rahul",
    userId: "user-rahul",
    name: "Rahul Mehta",
    role: "Videographer",
    percentage: 78
  },
  {
    id: "workload-ananya",
    userId: "user-ananya",
    name: "Ananya Rao",
    role: "Editor",
    percentage: 65
  },
  {
    id: "workload-karan",
    userId: "user-karan",
    name: "Karan Gill",
    role: "Photographer",
    percentage: 48
  }
];
