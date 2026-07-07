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

export type MemberStatus = "available" | "on-set" | "on-leave" | "unavailable";

export type Department =
  | "Production"
  | "Camera"
  | "Art"
  | "Electric"
  | "Sound"
  | "Costume"
  | "Post-Production";

export type RoleCategory =
  | "Director"
  | "Producer"
  | "Cinematographer"
  | "Editor"
  | "Production Assistant"
  | "Other";

export type CrewMember = {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: Department;
  roleCategory: RoleCategory;
  status: MemberStatus;
  currentProject?: string;
  projectStage?: string;
  availability: string;
  birthday?: string;
  avatarId?: string;
};

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

export const AVATAR_IMAGES: Record<string, string> = {
  aryan: "/images/dashboard/avatar-aryan.jpg",
  priya: "/images/dashboard/avatar-priya.jpg",
  rahul: "/images/dashboard/avatar-rahul.jpg",
  ananya: "/images/dashboard/avatar-ananya.jpg",
  karan: "/images/dashboard/avatar-karan.jpg"
};

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const crewMembers: CrewMember[] = [
  {
    id: "crew-1",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    jobTitle: "Production Designer",
    department: "Art",
    roleCategory: "Other",
    status: "available",
    currentProject: "Beyond Frames",
    projectStage: "Pre-Production",
    availability: "Jul 7 – Jul 15",
    avatarId: "priya"
  },
  {
    id: "crew-2",
    name: "Rahul Kumar",
    email: "rahul.kumar@example.com",
    jobTitle: "Director of Photography",
    department: "Camera",
    roleCategory: "Cinematographer",
    status: "on-set",
    currentProject: "Lumee Ad Campaign",
    projectStage: "In Production",
    availability: "Jul 5 – Jul 12",
    avatarId: "rahul"
  },
  {
    id: "crew-3",
    name: "Karan Mehta",
    email: "karan.mehta@example.com",
    jobTitle: "Gaffer",
    department: "Electric",
    roleCategory: "Other",
    status: "available",
    currentProject: "Echoes",
    projectStage: "Post-Production",
    availability: "Jul 8 – Jul 18",
    birthday: "07-12",
    avatarId: "karan"
  },
  {
    id: "crew-4",
    name: "Ananya Reddy",
    email: "ananya.reddy@example.com",
    jobTitle: "Costume Designer",
    department: "Costume",
    roleCategory: "Other",
    status: "on-leave",
    currentProject: "Wanderers",
    projectStage: "Pre-Production",
    availability: "Jul 6 – Jul 14",
    avatarId: "ananya"
  },
  {
    id: "crew-5",
    name: "Vikram Joshi",
    email: "vikram.joshi@example.com",
    jobTitle: "Sound Engineer",
    department: "Sound",
    roleCategory: "Other",
    status: "on-set",
    currentProject: "Beyond Frames",
    projectStage: "Production",
    availability: "Jul 7 – Jul 21",
    birthday: "08-02"
  },
  {
    id: "crew-6",
    name: "Meera Nair",
    email: "meera.nair@example.com",
    jobTitle: "Script Supervisor",
    department: "Production",
    roleCategory: "Producer",
    status: "available",
    currentProject: "Ad Campaign",
    projectStage: "Production",
    availability: "Jul 9 – Jul 16",
    birthday: "07-18"
  },
  {
    id: "crew-7",
    name: "Aman Verma",
    email: "aman.verma@example.com",
    jobTitle: "Editor",
    department: "Post-Production",
    roleCategory: "Editor",
    status: "available",
    currentProject: "Echoes",
    projectStage: "Post-Production",
    availability: "Jul 10 – Jul 20"
  },
  {
    id: "crew-8",
    name: "Aryan Wanve",
    email: "aryan@fylmico.test",
    jobTitle: "Director",
    department: "Production",
    roleCategory: "Director",
    status: "available",
    currentProject: "Beyond Frames",
    projectStage: "Production",
    availability: "Jul 7 – Jul 25",
    avatarId: "aryan"
  },
  {
    id: "crew-9",
    name: "Neha Kulkarni",
    email: "neha.kulkarni@example.com",
    jobTitle: "Producer",
    department: "Production",
    roleCategory: "Producer",
    status: "available",
    currentProject: "Silver Linings",
    projectStage: "Development",
    availability: "Jul 8 – Jul 30"
  },
  {
    id: "crew-10",
    name: "Rohan Deshmukh",
    email: "rohan.deshmukh@example.com",
    jobTitle: "1st Assistant Camera",
    department: "Camera",
    roleCategory: "Cinematographer",
    status: "on-set",
    currentProject: "Lumee Ad Campaign",
    projectStage: "In Production",
    availability: "Jul 5 – Jul 12"
  },
  {
    id: "crew-11",
    name: "Sanjay Patil",
    email: "sanjay.patil@example.com",
    jobTitle: "Grip",
    department: "Electric",
    roleCategory: "Other",
    status: "unavailable",
    availability: "Jul 1 – Jul 7"
  },
  {
    id: "crew-12",
    name: "Divya Rao",
    email: "divya.rao@example.com",
    jobTitle: "Art Director",
    department: "Art",
    roleCategory: "Other",
    status: "available",
    currentProject: "City Lights",
    projectStage: "In Production",
    availability: "Jul 9 – Jul 22"
  },
  {
    id: "crew-13",
    name: "Kabir Malhotra",
    email: "kabir.malhotra@example.com",
    jobTitle: "Boom Operator",
    department: "Sound",
    roleCategory: "Other",
    status: "on-set",
    currentProject: "Studio Sessions",
    projectStage: "Post-Production",
    availability: "Jul 6 – Jul 13"
  },
  {
    id: "crew-14",
    name: "Ishaan Kapoor",
    email: "ishaan.kapoor@example.com",
    jobTitle: "Colorist",
    department: "Post-Production",
    roleCategory: "Editor",
    status: "available",
    currentProject: "Afterglow",
    projectStage: "Post-Production",
    availability: "Jul 10 – Jul 17"
  },
  {
    id: "crew-15",
    name: "Simran Bedi",
    email: "simran.bedi@example.com",
    jobTitle: "Wardrobe Assistant",
    department: "Costume",
    roleCategory: "Other",
    status: "unavailable",
    availability: "Jul 3 – Jul 9"
  },
  {
    id: "crew-16",
    name: "Arjun Nair",
    email: "arjun.nair@example.com",
    jobTitle: "Camera Operator",
    department: "Camera",
    roleCategory: "Cinematographer",
    status: "available",
    currentProject: "Wanderers",
    projectStage: "Pre-Production",
    availability: "Jul 12 – Jul 19"
  },
  {
    id: "crew-17",
    name: "Tanvi Shah",
    email: "tanvi.shah@example.com",
    jobTitle: "Production Assistant",
    department: "Production",
    roleCategory: "Production Assistant",
    status: "available",
    currentProject: "Beyond Frames",
    projectStage: "Production",
    availability: "Jul 7 – Jul 25"
  },
  {
    id: "crew-18",
    name: "Farhan Sheikh",
    email: "farhan.sheikh@example.com",
    jobTitle: "Production Assistant",
    department: "Production",
    roleCategory: "Production Assistant",
    status: "on-set",
    currentProject: "Lumee Ad Campaign",
    projectStage: "In Production",
    availability: "Jul 5 – Jul 12"
  },
  {
    id: "crew-19",
    name: "Priyanka Iyer",
    email: "priyanka.iyer@example.com",
    jobTitle: "Makeup Artist",
    department: "Costume",
    roleCategory: "Other",
    status: "available",
    currentProject: "City Lights",
    projectStage: "In Production",
    availability: "Jul 9 – Jul 22"
  },
  {
    id: "crew-20",
    name: "Devansh Gupta",
    email: "devansh.gupta@example.com",
    jobTitle: "Gaffer",
    department: "Electric",
    roleCategory: "Other",
    status: "available",
    currentProject: "Roots",
    projectStage: "Completed",
    availability: "Jul 14 – Jul 21"
  },
  {
    id: "crew-21",
    name: "Riya Chatterjee",
    email: "riya.chatterjee@example.com",
    jobTitle: "Sound Designer",
    department: "Sound",
    roleCategory: "Other",
    status: "available",
    currentProject: "Echoes",
    projectStage: "Post-Production",
    availability: "Jul 10 – Jul 20"
  },
  {
    id: "crew-22",
    name: "Yash Thakur",
    email: "yash.thakur@example.com",
    jobTitle: "Director",
    department: "Production",
    roleCategory: "Director",
    status: "unavailable",
    availability: "Jul 2 – Jul 8"
  },
  {
    id: "crew-23",
    name: "Nikita Verma",
    email: "nikita.verma@example.com",
    jobTitle: "Producer",
    department: "Production",
    roleCategory: "Producer",
    status: "on-leave",
    availability: "Jul 4 – Jul 11"
  },
  {
    id: "crew-24",
    name: "Aditya Rao",
    email: "aditya.rao@example.com",
    jobTitle: "Editor",
    department: "Post-Production",
    roleCategory: "Editor",
    status: "on-set",
    currentProject: "Studio Sessions",
    projectStage: "Post-Production",
    availability: "Jul 6 – Jul 13"
  }
];
