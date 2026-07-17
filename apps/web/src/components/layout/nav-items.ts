import {
  BarChart3,
  Calendar,
  CalendarClock,
  Clapperboard,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Folder,
  FolderKanban,
  Home,
  ListChecks,
  Megaphone,
  MessageSquare,
  Settings,
  Users,
  type LucideIcon
} from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  href:
    | "/home"
    | "/calendar"
    | "/projects"
    | "/tasks"
    | "/review"
    | "/crews"
    | "/files"
    | "/storyboard"
    | "/scripts"
    | "/messages"
    | "/settings"
    | "/analytics"
    | "/bookings"
    | "/call-sheets"
    | "/announcements"
    | null;
  icon: LucideIcon;
  badge?: string;
};

export const navItems: NavItem[] = [
  { id: "home", label: "Home", href: "/home", icon: Home },
  { id: "projects", label: "Projects", href: "/projects", icon: FolderKanban },
  { id: "calendar", label: "Calendar", href: "/calendar", icon: Calendar },
  { id: "tasks", label: "Tasks", href: "/tasks", icon: ListChecks },
  { id: "review", label: "Review", href: "/review", icon: ClipboardCheck },
  { id: "crews", label: "Crews", href: "/crews", icon: Users },
  { id: "files", label: "Files", href: "/files", icon: Folder },
  {
    id: "storyboard",
    label: "Storyboard",
    href: "/storyboard",
    icon: Clapperboard
  },
  {
    id: "scripts",
    label: "Scripts",
    href: "/scripts",
    icon: FileText
  },
  {
    id: "messages",
    label: "Messages",
    href: "/messages",
    icon: MessageSquare
  },
  {
    id: "bookings",
    label: "Bookings",
    href: "/bookings",
    icon: CalendarClock
  },
  {
    id: "call-sheets",
    label: "Call Sheets",
    href: "/call-sheets",
    icon: ClipboardList
  },
  {
    id: "announcements",
    label: "Announcements",
    href: "/announcements",
    icon: Megaphone
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3
  },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings }
];
