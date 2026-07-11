import {
  Archive,
  File,
  FileSpreadsheet,
  FileText,
  Folder,
  Image,
  Music,
  Video,
  type LucideIcon
} from "lucide-react";

export type FileKind =
  | "folder"
  | "video"
  | "audio"
  | "image"
  | "pdf"
  | "spreadsheet"
  | "archive"
  | "other";

export type FileEntry = {
  id: string;
  name: string;
  kind: FileKind;
  size?: string;
  itemCount?: number;
  modified: string;
  modifiedBy: string;
};

export type FolderNode = {
  id: string;
  name: string;
  children?: FolderNode[];
};

export const FILE_KIND_META: Record<
  FileKind,
  { icon: LucideIcon; color: string; bg: string; label: string }
> = {
  folder: {
    icon: Folder,
    color: "text-amber-500",
    bg: "bg-amber-50",
    label: "Folder"
  },
  video: {
    icon: Video,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "MOV"
  },
  audio: {
    icon: Music,
    color: "text-violet-600",
    bg: "bg-violet-50",
    label: "WAV"
  },
  image: {
    icon: Image,
    color: "text-pink-600",
    bg: "bg-pink-50",
    label: "JPG"
  },
  pdf: {
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "PDF"
  },
  spreadsheet: {
    icon: FileSpreadsheet,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "XLSX"
  },
  archive: {
    icon: Archive,
    color: "text-orange-600",
    bg: "bg-orange-50",
    label: "ZIP"
  },
  other: {
    icon: File,
    color: "text-slate-500",
    bg: "bg-slate-100",
    label: "File"
  }
};

export const MEMBER_NAMES: Record<string, string> = {
  aryan: "Aryan Wanve",
  priya: "Priya S.",
  rahul: "Rahul K.",
  ananya: "Ananya R.",
  karan: "Karan M.",
  vikram: "Vikram J."
};

export const MEMBER_AVATARS: Record<string, string> = {
  aryan: "/images/dashboard/avatar-aryan.jpg",
  priya: "/images/dashboard/avatar-priya.jpg",
  rahul: "/images/dashboard/avatar-rahul.jpg",
  ananya: "/images/dashboard/avatar-ananya.jpg",
  karan: "/images/dashboard/avatar-karan.jpg"
};

export const folderTree: FolderNode[] = [
  {
    id: "beyond-frames",
    name: "Beyond Frames",
    children: [
      { id: "pre-production", name: "Pre-Production" },
      { id: "scripts-docs", name: "Scripts & Docs" },
      { id: "storyboards", name: "Storyboards" },
      { id: "shot-lists", name: "Shot Lists" },
      {
        id: "production",
        name: "Production",
        children: [
          { id: "day-1", name: "Day 1" },
          { id: "day-2", name: "Day 2" },
          { id: "day-3", name: "Day 3" },
          { id: "day-4", name: "Day 4" }
        ]
      },
      {
        id: "post-production",
        name: "Post-Production",
        children: [
          { id: "footage", name: "Footage" },
          { id: "audio", name: "Audio" },
          { id: "edits", name: "Edits" },
          { id: "graphics", name: "Graphics" }
        ]
      },
      { id: "references", name: "References" },
      { id: "archive", name: "Archive" }
    ]
  },
  { id: "wanderers", name: "Wanderers" },
  { id: "lumee-ad-campaign", name: "Lumee Ad Campaign" }
];

export const FOLDER_PATHS: Record<string, string[]> = {
  "beyond-frames": ["Beyond Frames"],
  "pre-production": ["Beyond Frames", "Pre-Production"],
  "scripts-docs": ["Beyond Frames", "Scripts & Docs"],
  storyboards: ["Beyond Frames", "Storyboards"],
  "shot-lists": ["Beyond Frames", "Shot Lists"],
  production: ["Beyond Frames", "Production"],
  "day-1": ["Beyond Frames", "Production", "Day 1"],
  "day-2": ["Beyond Frames", "Production", "Day 2"],
  "day-3": ["Beyond Frames", "Production", "Day 3"],
  "day-4": ["Beyond Frames", "Production", "Day 4"],
  "post-production": ["Beyond Frames", "Post-Production"],
  footage: ["Beyond Frames", "Post-Production", "Footage"],
  audio: ["Beyond Frames", "Post-Production", "Audio"],
  edits: ["Beyond Frames", "Post-Production", "Edits"],
  graphics: ["Beyond Frames", "Post-Production", "Graphics"],
  references: ["Beyond Frames", "References"],
  archive: ["Beyond Frames", "Archive"],
  wanderers: ["Wanderers"],
  "lumee-ad-campaign": ["Lumee Ad Campaign"]
};

export const FILE_CONTENT: Record<string, FileEntry[]> = {
  "day-2": [
    {
      id: "camera-a",
      name: "Camera A",
      kind: "folder",
      itemCount: 12,
      modified: "Today, 10:21 AM",
      modifiedBy: "rahul"
    },
    {
      id: "camera-b",
      name: "Camera B",
      kind: "folder",
      itemCount: 8,
      modified: "Today, 10:18 AM",
      modifiedBy: "vikram"
    },
    {
      id: "a001-c012",
      name: "A001_C012_0707WZ.mov",
      kind: "video",
      size: "2.45 GB",
      modified: "Today, 9:58 AM",
      modifiedBy: "karan"
    },
    {
      id: "a001-c013",
      name: "A001_C013_0707WZ.mov",
      kind: "video",
      size: "1.98 GB",
      modified: "Today, 9:58 AM",
      modifiedBy: "karan"
    },
    {
      id: "boom-near-take1",
      name: "Boom_Near_Take1.wav",
      kind: "audio",
      size: "54 MB",
      modified: "Today, 9:32 AM",
      modifiedBy: "ananya"
    },
    {
      id: "location-reference-02",
      name: "Location_Reference_02.jpg",
      kind: "image",
      size: "3.2 MB",
      modified: "Today, 9:21 AM",
      modifiedBy: "priya"
    },
    {
      id: "shot-list-day2",
      name: "Shot_List_Day2.pdf",
      kind: "pdf",
      size: "620 KB",
      modified: "Today, 8:47 AM",
      modifiedBy: "rahul"
    },
    {
      id: "call-sheet-day2",
      name: "Call_Sheet_Day2.xlsx",
      kind: "spreadsheet",
      size: "28 KB",
      modified: "Today, 8:30 AM",
      modifiedBy: "priya"
    },
    {
      id: "drone-footage",
      name: "Drone_Footage.zip",
      kind: "archive",
      size: "12.6 GB",
      modified: "Yesterday, 6:12 PM",
      modifiedBy: "vikram"
    },
    {
      id: "lighting-plan-day2",
      name: "Lighting_Plan_Day2.pdf",
      kind: "pdf",
      size: "1.1 MB",
      modified: "Yesterday, 5:44 PM",
      modifiedBy: "ananya"
    }
  ],
  "scripts-docs": [
    {
      id: "final-script-v3",
      name: "Final_Script_v3.pdf",
      kind: "pdf",
      size: "1.4 MB",
      modified: "3 days ago",
      modifiedBy: "aryan"
    },
    {
      id: "treatment-note",
      name: "Treatment_Note.pdf",
      kind: "pdf",
      size: "410 KB",
      modified: "5 days ago",
      modifiedBy: "aryan"
    },
    {
      id: "budget-breakdown",
      name: "Budget_Breakdown.xlsx",
      kind: "spreadsheet",
      size: "84 KB",
      modified: "1 week ago",
      modifiedBy: "priya"
    }
  ],
  footage: [
    {
      id: "b-roll-city",
      name: "B_Roll_City.mov",
      kind: "video",
      size: "3.8 GB",
      modified: "2 days ago",
      modifiedBy: "karan"
    },
    {
      id: "drone-pass-01",
      name: "Drone_Pass_01.mov",
      kind: "video",
      size: "5.1 GB",
      modified: "2 days ago",
      modifiedBy: "vikram"
    }
  ]
};

export const sharedWithMeFiles: FileEntry[] = [
  {
    id: "shared-storyboard",
    name: "Storyboard_v2_Final.pdf",
    kind: "pdf",
    size: "2.1 MB",
    modified: "Today, 11:02 AM",
    modifiedBy: "priya"
  },
  {
    id: "shared-brand-guidelines",
    name: "Brand_Guidelines.pdf",
    kind: "pdf",
    size: "4.6 MB",
    modified: "Yesterday, 3:20 PM",
    modifiedBy: "vikram"
  },
  {
    id: "shared-cut-01",
    name: "Rough_Cut_01.mov",
    kind: "video",
    size: "1.2 GB",
    modified: "2 days ago",
    modifiedBy: "rahul"
  }
];

export const trashFiles: FileEntry[] = [
  {
    id: "trash-test-footage",
    name: "test_footage.mov",
    kind: "video",
    size: "890 MB",
    modified: "3 hours ago",
    modifiedBy: "karan"
  },
  {
    id: "trash-old-script",
    name: "Old_Script_Draft.pdf",
    kind: "pdf",
    size: "310 KB",
    modified: "1 day ago",
    modifiedBy: "aryan"
  }
];

export const storageBreakdown: Array<{
  label: string;
  sizeGb: number;
  color: string;
}> = [
  { label: "Videos", sizeGb: 142, color: "#3b82f6" },
  { label: "Audio", sizeGb: 38, color: "#8b5cf6" },
  { label: "Documents", sizeGb: 24, color: "#f59e0b" },
  { label: "Images", sizeGb: 18, color: "#ec4899" },
  { label: "Other", sizeGb: 26, color: "#94a3b8" }
];

export const storageTotalGb = 1000;

export type FileActivity = {
  id: string;
  memberId: string;
  text: string;
  time: string;
};

export const recentFileActivity: FileActivity[] = [
  {
    id: "activity-1",
    memberId: "priya",
    text: "uploaded 3 files A001_C012_0707WZ.mov + 2 more",
    time: "10 minutes ago"
  },
  {
    id: "activity-2",
    memberId: "rahul",
    text: "updated Shot_List_Day2.pdf",
    time: "35 minutes ago"
  },
  {
    id: "activity-3",
    memberId: "vikram",
    text: "uploaded Drone_Footage.zip",
    time: "1 hour ago"
  },
  {
    id: "activity-4",
    memberId: "ananya",
    text: "created folder Camera B",
    time: "2 hours ago"
  },
  {
    id: "activity-5",
    memberId: "karan",
    text: "deleted test_footage.mov",
    time: "3 hours ago"
  }
];

export const quickAccess: Array<{
  id: string;
  label: string;
  count: number;
}> = [
  { id: "starred", label: "Starred", count: 24 },
  { id: "shared-links", label: "Shared Links", count: 16 },
  { id: "offline", label: "Offline Files", count: 8 },
  { id: "trash", label: "Trash", count: 12 }
];
