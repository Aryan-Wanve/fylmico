import {
  Bell,
  CreditCard,
  Database,
  KeyRound,
  Palette,
  Plug,
  User,
  Users,
  type LucideIcon
} from "lucide-react";

export type SettingsSectionId =
  | "profile"
  | "workspace"
  | "members"
  | "notifications"
  | "appearance"
  | "integrations"
  | "security"
  | "billing"
  | "advanced";

export const SETTINGS_SECTIONS: Array<{
  id: SettingsSectionId;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    id: "profile",
    label: "Profile & Account",
    description: "Personal info and password",
    icon: User
  },
  {
    id: "workspace",
    label: "Workspace",
    description: "General workspace settings",
    icon: Palette
  },
  {
    id: "members",
    label: "Members & Permissions",
    description: "Invite members and set roles",
    icon: Users
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Configure alerts and reminders",
    icon: Bell
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme, color and display",
    icon: Palette
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "Connect your favorite tools",
    icon: Plug
  },
  {
    id: "security",
    label: "Security",
    description: "Password, 2FA and sessions",
    icon: KeyRound
  },
  {
    id: "billing",
    label: "Billing",
    description: "Plans, billing and invoices",
    icon: CreditCard
  },
  {
    id: "advanced",
    label: "Advanced",
    description: "Import, export and more",
    icon: Database
  }
];

export const profile = {
  fullName: "Aryan Wanve",
  email: "aryan.wanve@fylmico.com",
  verified: true,
  role: "Director",
  phone: "+91 70672 42919",
  timezone: "Asia/Kolkata (IST)",
  joined: "Feb 14, 2026",
  avatar: "/images/dashboard/avatar-aryan.jpg"
};

export type AccountSession = {
  id: string;
  device: string;
  location: string;
  ip: string;
  current: boolean;
  lastActive: string;
};

export const sessions: AccountSession[] = [
  {
    id: "session-1",
    device: "Windows • Chrome",
    location: "Indore, India",
    ip: "103.21.45.98",
    current: true,
    lastActive: "Active now"
  },
  {
    id: "session-2",
    device: "iPhone 14 • Safari",
    location: "Mumbai, India",
    ip: "117.22.11.43",
    current: false,
    lastActive: "2 hours ago"
  }
];

export const workspacePlan = {
  name: "Pro Plan",
  features: [
    "Unlimited Projects",
    "Unlimited Storage",
    "Advanced Analytics",
    "Priority Support"
  ]
};

export const storageUsedGb = 45.6;
export const storageTotalGb = 100;

export type QuickAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  destructive?: boolean;
};

export const workspaceInfo = {
  name: "Nova Frame House",
  handle: "nova-frame",
  description: "Commercial films, reels, launch videos, and event edits.",
  timezone: "Asia/Kolkata (IST)",
  dateFormat: "DD/MM/YYYY"
};

export type NotificationPreference = {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
};

export const notificationPreferences: NotificationPreference[] = [
  {
    id: "task-reminders",
    label: "Task reminders",
    description: "Get notified before a task is due.",
    email: true,
    push: true
  },
  {
    id: "mentions",
    label: "Mentions",
    description: "When someone @mentions you in a message.",
    email: true,
    push: true
  },
  {
    id: "comments",
    label: "Comments",
    description: "New comments on your tasks or files.",
    email: true,
    push: false
  },
  {
    id: "weekly-digest",
    label: "Weekly digest",
    description: "A summary of workspace activity every week.",
    email: true,
    push: false
  }
];

export type IntegrationEntry = {
  id: string;
  name: string;
  description: string;
  connected: boolean;
};

export const integrations: IntegrationEntry[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Get notifications in your workspace channels.",
    connected: true
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Sync and back up files directly from Drive.",
    connected: false
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Schedule and join calls from Fylmico.",
    connected: true
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Back up production files automatically.",
    connected: false
  }
];

export type BillingInvoice = {
  id: string;
  date: string;
  amount: string;
  status: "Paid" | "Due";
};

export const billingHistory: BillingInvoice[] = [
  { id: "inv-2026-07", date: "Jul 1, 2026", amount: "$29.00", status: "Paid" },
  { id: "inv-2026-06", date: "Jun 1, 2026", amount: "$29.00", status: "Paid" },
  { id: "inv-2026-05", date: "May 1, 2026", amount: "$29.00", status: "Paid" }
];
