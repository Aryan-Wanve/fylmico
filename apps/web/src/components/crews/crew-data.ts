import {
  Briefcase,
  Camera,
  Film,
  Headphones,
  Palette,
  Shirt,
  Zap,
  type LucideIcon
} from "lucide-react";
import type {
  CrewDepartment,
  CrewMember,
  CrewMemberStatus,
  CrewRoleCategory
} from "@/types/base";

export type Department = CrewDepartment;
export type MemberStatus = CrewMemberStatus;
export type RoleCategory = CrewRoleCategory;
export type { CrewMember };

export const DEPARTMENT_ORDER: Department[] = [
  "Production",
  "Camera",
  "Art",
  "Electric",
  "Sound",
  "Costume",
  "Post-Production"
];

export const DEPARTMENT_META: Record<
  Department,
  { icon: LucideIcon; color: string; bg: string }
> = {
  Production: {
    icon: Briefcase,
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  Camera: { icon: Camera, color: "text-blue-600", bg: "bg-blue-50" },
  Art: { icon: Palette, color: "text-violet-600", bg: "bg-violet-50" },
  Electric: { icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
  Sound: { icon: Headphones, color: "text-cyan-600", bg: "bg-cyan-50" },
  Costume: { icon: Shirt, color: "text-pink-600", bg: "bg-pink-50" },
  "Post-Production": {
    icon: Film,
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  }
};

export const STATUS_ORDER: MemberStatus[] = [
  "available",
  "on-set",
  "on-leave",
  "unavailable"
];

export const STATUS_META: Record<
  MemberStatus,
  { label: string; badge: string; dot: string }
> = {
  available: {
    label: "Available",
    badge: "bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-500"
  },
  "on-set": {
    label: "On Set",
    badge: "bg-amber-50 text-amber-600",
    dot: "bg-amber-500"
  },
  "on-leave": {
    label: "On Leave",
    badge: "bg-slate-100 text-slate-500",
    dot: "bg-slate-400"
  },
  unavailable: {
    label: "Unavailable",
    badge: "bg-red-50 text-red-600",
    dot: "bg-red-500"
  }
};

export const ROLE_CATEGORY_ORDER: RoleCategory[] = [
  "Director",
  "Producer",
  "Cinematographer",
  "Editor",
  "Production Assistant"
];

export const ROLE_CATEGORY_META: Record<RoleCategory, { badge: string }> = {
  Director: { badge: "bg-violet-50 text-violet-600" },
  Producer: { badge: "bg-emerald-50 text-emerald-600" },
  Cinematographer: { badge: "bg-blue-50 text-blue-600" },
  Editor: { badge: "bg-amber-50 text-amber-600" },
  "Production Assistant": { badge: "bg-cyan-50 text-cyan-600" },
  Other: { badge: "bg-slate-100 text-slate-500" }
};

export function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return initials.toUpperCase() || "?";
}
