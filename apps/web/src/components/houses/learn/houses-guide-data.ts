import {
  BarChart3,
  Calendar,
  CalendarClock,
  Clapperboard,
  Folder,
  FolderKanban,
  ListChecks,
  MessageSquare,
  Users,
  type LucideIcon
} from "lucide-react";

export type GuideFeature = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const guideFeatures: GuideFeature[] = [
  {
    id: "projects",
    title: "Projects",
    description:
      "Track every production from development to delivery, with status, progress, and a due-date view for the whole team.",
    icon: FolderKanban
  },
  {
    id: "tasks",
    title: "Tasks",
    description:
      "Break work down into assignable tasks, group by status or priority, and never lose track of what's due today.",
    icon: ListChecks
  },
  {
    id: "calendar",
    title: "Calendar",
    description:
      "See shoot days, deadlines, and meetings side by side so scheduling conflicts show up before they become problems.",
    icon: Calendar
  },
  {
    id: "crews",
    title: "Crews",
    description:
      "Keep a roster of everyone who works on your productions — roles, departments, availability, and who's on set today.",
    icon: Users
  },
  {
    id: "files",
    title: "Files",
    description:
      "Organize footage, scripts, and deliverables in nested folders your whole crew can access from one place.",
    icon: Folder
  },
  {
    id: "storyboard",
    title: "Storyboard",
    description:
      "Plan shots and sequences visually, with shot type, camera notes, and reference frames attached to every board.",
    icon: Clapperboard
  },
  {
    id: "messages",
    title: "Messages",
    description:
      "Chat by channel or DM, share files inline, and keep production discussions out of scattered group texts.",
    icon: MessageSquare
  },
  {
    id: "bookings",
    title: "Bookings",
    description:
      "Coordinate gear, locations, and crew bookings so everything you need is confirmed before the shoot day.",
    icon: CalendarClock
  },
  {
    id: "analytics",
    title: "Analytics",
    description:
      "Get a birds-eye view of workload, deadlines, and team activity across every project in the house.",
    icon: BarChart3
  }
];

export type GuideRole = {
  name: string;
  description: string;
};

export const guideRoles: GuideRole[] = [
  {
    name: "Owner",
    description:
      "Controls house settings, billing, and can add or remove members and roles."
  },
  {
    name: "Producer",
    description:
      "Plans shoots, manages schedules and budgets, and coordinates delivery across the team."
  },
  {
    name: "Editor",
    description:
      "Owns cuts, revisions, timelines, and final exports during post-production."
  },
  {
    name: "Videographer",
    description:
      "Handles on-set capture, camera plans, and footage handoff to the edit team."
  },
  {
    name: "Photographer",
    description:
      "Covers stills, behind-the-scenes shots, thumbnails, and campaign imagery."
  },
  {
    name: "Designer",
    description:
      "Builds graphics, titles, and visual assets used across the production."
  },
  {
    name: "Client",
    description:
      "A limited-access role for reviewing deliverables and leaving feedback without touching internal tools."
  }
];

export type GuideUseCase = {
  title: string;
  description: string;
};

export const guideUseCases: GuideUseCase[] = [
  {
    title: "Independent filmmakers",
    description:
      "Run a short film or feature from script to final cut with one house per production."
  },
  {
    title: "Ad agencies & brand studios",
    description:
      "Keep every client campaign in its own house, with clients invited as read-only collaborators."
  },
  {
    title: "Wedding & event videographers",
    description:
      "Spin up a house per event to manage shot lists, delivery timelines, and client approvals."
  },
  {
    title: "Content studios & YouTubers",
    description:
      "Coordinate recurring shoots, editors, and publishing schedules across a small team."
  },
  {
    title: "Film schools & clubs",
    description:
      "Give student crews a shared space to plan, shoot, and hand off student productions."
  },
  {
    title: "Multi-production houses",
    description:
      "Run several shows or campaigns at once, each with its own house, crew, and calendar."
  }
];

export type GuideFaq = {
  question: string;
  answer: string;
};

export const guideFaqs: GuideFaq[] = [
  {
    question: "Can I be a member of more than one House?",
    answer:
      "Yes. You can belong to as many houses as you're invited to or create yourself, and switch between them at any time."
  },
  {
    question: "Who can invite new members?",
    answer:
      "By default, only the Owner and Producers can send invites, but this can be adjusted per house in Settings → Members & Permissions."
  },
  {
    question: "Can clients or freelancers join without full access?",
    answer:
      "Yes. Invite them with the Client role for a limited, review-focused view, or with a specific crew role if they need to contribute directly."
  },
  {
    question: "What happens to a House's data if I leave?",
    answer:
      "Projects, files, and messages stay with the house. Only your personal access is removed — nothing you contributed is deleted."
  },
  {
    question: "Is there a limit to how many houses I can create?",
    answer:
      "Free workspaces can create one active house at a time. Upgrading to Pro removes that limit — see Settings → Billing for plan details."
  }
];
