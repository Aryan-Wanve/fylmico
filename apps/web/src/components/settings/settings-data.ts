import {
  Bell,
  CreditCard,
  Database,
  KeyRound,
  Palette,
  Plug,
  Users,
  type LucideIcon
} from "lucide-react";

export type SettingsSectionId =
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
