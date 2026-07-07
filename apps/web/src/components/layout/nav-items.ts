import {
  BarChart3,
  Calendar,
  CalendarClock,
  Clapperboard,
  Folder,
  FolderKanban,
  Home,
  ListChecks,
  MessageSquare,
  Settings,
  Users,
  type LucideIcon
} from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  href: "/" | "/calendar" | "/projects" | null;
  icon: LucideIcon;
  badge?: string;
};

export const navItems: NavItem[] = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "projects", label: "Projects", href: "/projects", icon: FolderKanban },
  { id: "calendar", label: "Calendar", href: "/calendar", icon: Calendar },
  { id: "tasks", label: "Tasks", href: null, icon: ListChecks },
  { id: "crews", label: "Crews", href: null, icon: Users },
  { id: "files", label: "Files", href: null, icon: Folder },
  { id: "storyboard", label: "Storyboard", href: null, icon: Clapperboard },
  {
    id: "messages",
    label: "Messages",
    href: null,
    icon: MessageSquare,
    badge: "4"
  },
  { id: "bookings", label: "Bookings", href: null, icon: CalendarClock },
  { id: "analytics", label: "Analytics", href: null, icon: BarChart3 },
  { id: "settings", label: "Settings", href: null, icon: Settings }
];
