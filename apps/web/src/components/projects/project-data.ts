import {
  Camera,
  Clapperboard,
  Heart,
  Megaphone,
  Mic,
  Music,
  type LucideIcon
} from "lucide-react";
import type {
  Project,
  ProjectCoverIcon,
  ProjectStage,
  ProjectStatus,
  ProjectType
} from "@/types/base";

export type { Project, ProjectStage, ProjectStatus };

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

export const PROJECT_TYPES: ProjectType[] = [
  "Short Film",
  "Documentary",
  "Commercial",
  "Music Video",
  "Feature Film",
  "Corporate Video",
  "Web Series",
  "Wedding Film"
];

export const COVER_ICONS: Record<ProjectCoverIcon, LucideIcon> = {
  camera: Camera,
  clapperboard: Clapperboard,
  heart: Heart,
  megaphone: Megaphone,
  mic: Mic,
  music: Music
};

export function isProjectOverdue(project: Project): boolean {
  if (project.status === "completed" || !project.dueDate) {
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
