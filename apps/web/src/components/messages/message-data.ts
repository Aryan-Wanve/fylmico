import {
  Clapperboard,
  Headphones,
  Megaphone,
  Palette,
  Wrench,
  type LucideIcon
} from "lucide-react";

export type ChannelKind = "group" | "dm";

export type ChatAttachment = { name: string; size: string };

export type ChatMessageItem = {
  id: string;
  authorId: string;
  time: string;
  body: string;
  attachment?: ChatAttachment;
};

export type ChannelFile = {
  id: string;
  name: string;
  size: string;
  authorId: string;
  time: string;
};

export type ChannelTask = {
  id: string;
  title: string;
  assigneeId: string;
  done: boolean;
};

export type ChannelEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
};

export type Channel = {
  id: string;
  name: string;
  kind: ChannelKind;
  description: string;
  memberIds: string[];
  pinned: boolean;
  unreadCount: number;
  lastMessagePreview: string;
  lastMessageTime: string;
  colorClass: string;
  icon?: LucideIcon;
  typingAuthorId?: string;
  messages: ChatMessageItem[];
  files: ChannelFile[];
  tasks: ChannelTask[];
  events: ChannelEvent[];
};

export const MEMBER_NAMES: Record<string, string> = {
  aryan: "Aryan Wanve",
  priya: "Priya Sharma",
  rahul: "Rahul Kumar",
  ananya: "Ananya Reddy",
  karan: "Karan Mehta",
  vikram: "Vikram Joshi",
  meera: "Meera Nair"
};

export const MEMBER_AVATARS: Record<string, string> = {
  aryan: "/images/dashboard/avatar-aryan.jpg",
  priya: "/images/dashboard/avatar-priya.jpg",
  rahul: "/images/dashboard/avatar-rahul.jpg",
  ananya: "/images/dashboard/avatar-ananya.jpg",
  karan: "/images/dashboard/avatar-karan.jpg"
};

export function getInitials(id: string): string {
  const name = MEMBER_NAMES[id] ?? id;
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const currentUserId = "aryan";

export const channels: Channel[] = [
  {
    id: "beyond-frames-team",
    name: "Beyond Frames Team",
    kind: "group",
    description: "General coordination for the Beyond Frames production.",
    memberIds: ["aryan", "priya", "rahul", "ananya", "karan"],
    pinned: true,
    unreadCount: 2,
    lastMessagePreview: "Rahul: Shot list for Day 3 is ready",
    lastMessageTime: "10:24 AM",
    colorClass: "bg-violet-600",
    messages: [
      {
        id: "bf-1",
        authorId: "rahul",
        time: "10:24 AM",
        body: "Shot list for Day 3 is ready — check the Files tab."
      }
    ],
    files: [],
    tasks: [],
    events: []
  },
  {
    id: "production-crew",
    name: "Production Crew",
    kind: "group",
    description: "On-set logistics and daily call times.",
    memberIds: ["aryan", "rahul", "karan", "vikram"],
    pinned: true,
    unreadCount: 1,
    lastMessagePreview: "Vikram: Location recce at 5 PM",
    lastMessageTime: "9:15 AM",
    colorClass: "bg-blue-600",
    icon: Clapperboard,
    messages: [
      {
        id: "pc-1",
        authorId: "vikram",
        time: "9:15 AM",
        body: "Location recce at 5 PM — meet at the van."
      }
    ],
    files: [],
    tasks: [],
    events: []
  },
  {
    id: "creative-department",
    name: "Creative Department",
    kind: "group",
    description: "Mood boards, references, and visual direction.",
    memberIds: ["aryan", "priya", "ananya"],
    pinned: true,
    unreadCount: 0,
    lastMessagePreview: "Priya: Moodboard for Scene 2",
    lastMessageTime: "Yesterday",
    colorClass: "bg-pink-600",
    icon: Palette,
    messages: [
      {
        id: "cd-1",
        authorId: "priya",
        time: "Yesterday",
        body: "Moodboard for Scene 2 is up for review."
      }
    ],
    files: [],
    tasks: [],
    events: []
  },
  {
    id: "ad-campaign-team",
    name: "Ad Campaign Team",
    kind: "group",
    description:
      "This channel is for all discussions related to the Ad Campaign project.",
    memberIds: ["aryan", "priya", "rahul", "ananya", "karan", "vikram"],
    pinned: false,
    unreadCount: 1,
    lastMessagePreview: "Ananya: Please review the ad script",
    lastMessageTime: "11:02 AM",
    colorClass: "bg-[#654cff]",
    icon: Megaphone,
    typingAuthorId: "rahul",
    messages: [
      {
        id: "ac-1",
        authorId: "ananya",
        time: "10:15 AM",
        body: "Hey team! Here's the first draft of the ad script for your review.",
        attachment: { name: "Ad_Script_Draft_v1.docx", size: "2.4 MB" }
      },
      {
        id: "ac-2",
        authorId: "rahul",
        time: "10:18 AM",
        body: "Looks good overall. I think the hook in scene 2 can be stronger."
      },
      {
        id: "ac-3",
        authorId: "priya",
        time: "10:21 AM",
        body: "Agree with Rahul. I've added a few lines in the comments."
      },
      {
        id: "ac-4",
        authorId: "vikram",
        time: "10:23 AM",
        body: "Also, let's confirm the VO artist by EOD. @Ananya Reddy"
      },
      {
        id: "ac-5",
        authorId: "ananya",
        time: "10:24 AM",
        body: "Noted! I'll share the revised draft by this evening."
      }
    ],
    files: [
      {
        id: "ac-file-1",
        name: "Ad_Script_Draft_v1.docx",
        size: "2.4 MB",
        authorId: "priya",
        time: "10:15 AM"
      },
      {
        id: "ac-file-2",
        name: "Moodboard_Concepts.pdf",
        size: "8.7 MB",
        authorId: "meera",
        time: "Yesterday"
      },
      {
        id: "ac-file-3",
        name: "Brand_Guide.pdf",
        size: "3.1 MB",
        authorId: "rahul",
        time: "Jul 5"
      }
    ],
    tasks: [
      {
        id: "ac-task-1",
        title: "Finalize ad script",
        assigneeId: "ananya",
        done: false
      },
      {
        id: "ac-task-2",
        title: "Confirm VO artist",
        assigneeId: "vikram",
        done: false
      },
      {
        id: "ac-task-3",
        title: "Review moodboard concepts",
        assigneeId: "priya",
        done: true
      }
    ],
    events: [
      {
        id: "ac-event-1",
        title: "Ad script review call",
        date: "Jul 8",
        time: "3:00 PM"
      },
      {
        id: "ac-event-2",
        title: "VO recording session",
        date: "Jul 10",
        time: "11:00 AM"
      }
    ]
  },
  {
    id: "wanderers-documentary",
    name: "Wanderers Documentary",
    kind: "group",
    description: "Coordination for the Wanderers documentary shoot.",
    memberIds: ["aryan", "karan", "ananya"],
    pinned: false,
    unreadCount: 0,
    lastMessagePreview: "Karan: Rough cut v2 uploaded",
    lastMessageTime: "10:45 AM",
    colorClass: "bg-slate-700",
    messages: [
      {
        id: "wd-1",
        authorId: "karan",
        time: "10:45 AM",
        body: "Rough cut v2 uploaded to the Files tab — take a look when you can."
      }
    ],
    files: [],
    tasks: [],
    events: []
  },
  {
    id: "echoes-post-team",
    name: "Echoes Post Team",
    kind: "group",
    description: "Post-production notes for Echoes.",
    memberIds: ["aryan", "rahul", "priya"],
    pinned: false,
    unreadCount: 0,
    lastMessagePreview: "Meera: Color grading notes",
    lastMessageTime: "Yesterday",
    colorClass: "bg-blue-500",
    messages: [
      {
        id: "ep-1",
        authorId: "meera",
        time: "Yesterday",
        body: "Color grading notes are attached — mostly minor tweaks."
      }
    ],
    files: [],
    tasks: [],
    events: []
  },
  {
    id: "sound-department",
    name: "Sound Department",
    kind: "group",
    description: "Sound design and mixing coordination.",
    memberIds: ["aryan", "vikram"],
    pinned: false,
    unreadCount: 0,
    lastMessagePreview: "Vikram: Final mix at 6 PM",
    lastMessageTime: "Yesterday",
    colorClass: "bg-emerald-600",
    icon: Headphones,
    messages: [
      {
        id: "sd-1",
        authorId: "vikram",
        time: "Yesterday",
        body: "Final mix session at 6 PM in Studio B."
      }
    ],
    files: [],
    tasks: [],
    events: []
  },
  {
    id: "equipment-team",
    name: "Equipment Team",
    kind: "group",
    description: "Gear requests, maintenance, and availability.",
    memberIds: ["aryan", "rahul", "karan"],
    pinned: false,
    unreadCount: 0,
    lastMessagePreview: "Rahul: New lenses arrived",
    lastMessageTime: "Jul 5",
    colorClass: "bg-orange-600",
    icon: Wrench,
    messages: [
      {
        id: "eq-1",
        authorId: "rahul",
        time: "Jul 5",
        body: "New lenses arrived — logging them into inventory today."
      }
    ],
    files: [],
    tasks: [],
    events: []
  },
  {
    id: "dm-ananya",
    name: "Ananya Reddy",
    kind: "dm",
    description: "Direct messages with Ananya Reddy.",
    memberIds: ["aryan", "ananya"],
    pinned: false,
    unreadCount: 0,
    lastMessagePreview: "You: Great, thanks!",
    lastMessageTime: "Jul 4",
    colorClass: "bg-rose-500",
    messages: [
      {
        id: "dm-1",
        authorId: "ananya",
        time: "Jul 4",
        body: "Sent over the updated script notes."
      },
      {
        id: "dm-2",
        authorId: "aryan",
        time: "Jul 4",
        body: "Great, thanks!"
      }
    ],
    files: [],
    tasks: [],
    events: []
  }
];
