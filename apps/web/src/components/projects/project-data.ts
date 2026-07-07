import {
  Camera,
  Clapperboard,
  Heart,
  Megaphone,
  Mic,
  Music,
  type LucideIcon
} from "lucide-react";

export type ProjectStage =
  | "Development"
  | "Pre-Production"
  | "In Production"
  | "In Progress"
  | "Post-Production"
  | "On Hold"
  | "Completed";

export type ProjectStatus = "active" | "in-progress" | "on-hold" | "completed";

export type Project = {
  id: string;
  title: string;
  type: string;
  genre: string;
  description: string;
  stage: ProjectStage;
  status: ProjectStatus;
  progress: number;
  image?: string;
  coverGradient?: string;
  coverIcon?: LucideIcon;
  dueDate: string;
  teamIds: string[];
  teamOverflow: number;
};

export const STAGE_TO_STATUS: Record<ProjectStage, ProjectStatus> = {
  Development: "active",
  "Pre-Production": "active",
  "In Production": "active",
  "In Progress": "in-progress",
  "Post-Production": "in-progress",
  "On Hold": "on-hold",
  Completed: "completed"
};

export const STAGE_BADGE_STYLES: Record<ProjectStage, string> = {
  Development: "bg-slate-600/90",
  "Pre-Production": "bg-[#a8560f]/90",
  "In Production": "bg-[#2563eb]/90",
  "In Progress": "bg-[#16c784]/90",
  "Post-Production": "bg-[#dc2626]/85",
  "On Hold": "bg-[#f59e0b]/90",
  Completed: "bg-[#11142c]/85"
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  "in-progress": "In Progress",
  "on-hold": "On Hold",
  completed: "Completed"
};

export const STATUS_ORDER: ProjectStatus[] = [
  "active",
  "in-progress",
  "on-hold",
  "completed"
];

export const PROJECT_TYPES = [
  "Short Film",
  "Documentary",
  "Commercial",
  "Music Video",
  "Feature Film",
  "Corporate Video",
  "Web Series",
  "Wedding Film"
];

export const MEMBER_LABELS: Record<string, string> = {
  "user-aryan": "AW",
  "user-priya": "PS",
  "user-rahul": "RM",
  "user-ananya": "AR",
  "user-karan": "KG"
};

export const MEMBER_AVATARS: Record<string, string> = {
  "user-aryan": "/images/dashboard/avatar-aryan.jpg",
  "user-priya": "/images/dashboard/avatar-priya.jpg",
  "user-rahul": "/images/dashboard/avatar-rahul.jpg",
  "user-ananya": "/images/dashboard/avatar-ananya.jpg",
  "user-karan": "/images/dashboard/avatar-karan.jpg"
};

export const projects: Project[] = [
  {
    id: "beyond-frames",
    title: "Beyond Frames",
    type: "Short Film",
    genre: "Drama",
    description:
      "A coming-of-age story about a filmmaker searching for his voice.",
    stage: "In Progress",
    status: "in-progress",
    progress: 68,
    image: "/images/dashboard/project-beyond-frames.jpg",
    dueDate: "Jul 20, 2026",
    teamIds: ["user-aryan", "user-priya", "user-rahul"],
    teamOverflow: 3
  },
  {
    id: "wanderers",
    title: "Wanderers",
    type: "Documentary",
    genre: "Travel",
    description:
      "Exploring the unseen places and the people who call them home.",
    stage: "Pre-Production",
    status: "active",
    progress: 42,
    image: "/images/dashboard/project-wanderers.jpg",
    dueDate: "Aug 12, 2026",
    teamIds: ["user-priya", "user-karan", "user-ananya"],
    teamOverflow: 2
  },
  {
    id: "lumea",
    title: "Lumee Ad Campaign",
    type: "Commercial",
    genre: "Brand Film",
    description: "A visual campaign for Lumee's new summer collection.",
    stage: "In Production",
    status: "active",
    progress: 75,
    image: "/images/dashboard/project-lumea.jpg",
    dueDate: "Jun 30, 2026",
    teamIds: ["user-rahul", "user-ananya", "user-karan"],
    teamOverflow: 4
  },
  {
    id: "echoes",
    title: "Echoes",
    type: "Music Video",
    genre: "Indie",
    description: "An experimental music video for an upcoming indie artist.",
    stage: "Post-Production",
    status: "in-progress",
    progress: 30,
    image: "/images/dashboard/project-echoes.jpg",
    dueDate: "Sep 5, 2026",
    teamIds: ["user-aryan", "user-karan"],
    teamOverflow: 1
  },
  {
    id: "silver-linings",
    title: "Silver Linings",
    type: "Feature Film",
    genre: "Coming-of-age",
    description:
      "A debut feature following three siblings across one long summer.",
    stage: "Development",
    status: "active",
    progress: 12,
    coverGradient: "from-indigo-500 via-purple-600 to-fuchsia-700",
    coverIcon: Clapperboard,
    dueDate: "Nov 2, 2026",
    teamIds: ["user-priya", "user-aryan"],
    teamOverflow: 5
  },
  {
    id: "city-lights",
    title: "City Lights",
    type: "Corporate Video",
    genre: "Brand",
    description: "A brand film for a fintech client's national rollout.",
    stage: "In Production",
    status: "active",
    progress: 55,
    coverGradient: "from-sky-400 via-blue-600 to-indigo-700",
    coverIcon: Megaphone,
    dueDate: "Jul 25, 2026",
    teamIds: ["user-rahul", "user-priya"],
    teamOverflow: 2
  },
  {
    id: "long-way-home",
    title: "The Long Way Home",
    type: "Documentary",
    genre: "Nature",
    description:
      "Tracking a season of wildlife migration across three continents.",
    stage: "Pre-Production",
    status: "active",
    progress: 20,
    coverGradient: "from-emerald-400 via-teal-600 to-cyan-800",
    coverIcon: Camera,
    dueDate: "Oct 10, 2026",
    teamIds: ["user-karan", "user-ananya"],
    teamOverflow: 3
  },
  {
    id: "afterglow",
    title: "Afterglow",
    type: "Music Video",
    genre: "Pop",
    description: "A neon-lit visual for a rising pop artist's lead single.",
    stage: "In Progress",
    status: "in-progress",
    progress: 80,
    coverGradient: "from-pink-400 via-rose-500 to-red-700",
    coverIcon: Music,
    dueDate: "Jul 15, 2026",
    teamIds: ["user-aryan", "user-rahul"],
    teamOverflow: 1
  },
  {
    id: "studio-sessions",
    title: "Studio Sessions",
    type: "Web Series",
    genre: "Interview",
    description: "A weekly interview series with independent filmmakers.",
    stage: "Post-Production",
    status: "in-progress",
    progress: 90,
    coverGradient: "from-amber-300 via-orange-500 to-red-600",
    coverIcon: Mic,
    dueDate: "Jul 12, 2026",
    teamIds: ["user-priya", "user-ananya"],
    teamOverflow: 0
  },
  {
    id: "forever-and-always",
    title: "Forever & Always",
    type: "Wedding Film",
    genre: "Romance",
    description:
      "A destination wedding film paused pending venue confirmation.",
    stage: "On Hold",
    status: "on-hold",
    progress: 45,
    coverGradient: "from-slate-500 via-slate-700 to-slate-900",
    coverIcon: Heart,
    dueDate: "Aug 1, 2026",
    teamIds: ["user-karan"],
    teamOverflow: 1
  },
  {
    id: "neon-nights",
    title: "Neon Nights",
    type: "Music Video",
    genre: "Electronic",
    description: "A synth-driven visual for an electronic duo's debut single.",
    stage: "Completed",
    status: "completed",
    progress: 100,
    coverGradient: "from-violet-500 via-purple-700 to-indigo-900",
    coverIcon: Music,
    dueDate: "Jun 1, 2026",
    teamIds: ["user-aryan", "user-rahul", "user-ananya"],
    teamOverflow: 0
  },
  {
    id: "roots",
    title: "Roots",
    type: "Documentary",
    genre: "Culture",
    description: "A short documentary on a family-run textile business.",
    stage: "Completed",
    status: "completed",
    progress: 100,
    coverGradient: "from-lime-400 via-emerald-600 to-teal-800",
    coverIcon: Camera,
    dueDate: "May 15, 2026",
    teamIds: ["user-priya", "user-karan"],
    teamOverflow: 1
  }
];

export function isProjectOverdue(project: Project): boolean {
  if (project.status === "completed") {
    return false;
  }

  const dueDate = new Date(project.dueDate);

  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dueDate.getTime() < today.getTime();
}
