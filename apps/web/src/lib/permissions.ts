export const PERMISSIONS = [
  "view_projects",
  "edit_projects",
  "create_tasks",
  "delete_tasks",
  "view_files",
  "upload_files",
  "delete_files",
  "manage_crew",
  "invite_members",
  "remove_members",
  "manage_calendar",
  "manage_bookings",
  "manage_house_settings",
  "manage_roles",
  "approve_members",
  "manage_drive",
  "manage_storyboards",
  "manage_budget",
  "manage_clients"
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  view_projects: "View Projects",
  edit_projects: "Edit Projects",
  create_tasks: "Create Tasks",
  delete_tasks: "Delete Tasks",
  view_files: "View Files",
  upload_files: "Upload Files",
  delete_files: "Delete Files",
  manage_crew: "Manage Crew",
  invite_members: "Invite Members",
  remove_members: "Remove Members",
  manage_calendar: "Manage Calendar",
  manage_bookings: "Manage Bookings",
  manage_house_settings: "Manage House Settings",
  manage_roles: "Manage Roles",
  approve_members: "Approve Members",
  manage_drive: "Manage Drive",
  manage_storyboards: "Manage Storyboards",
  manage_budget: "Manage Budget",
  manage_clients: "Manage Clients"
};

const ALL: Permission[] = [...PERMISSIONS];

export const PERMISSION_PRESETS: Record<string, Permission[]> = {
  Owner: ALL,
  Admin: ALL.filter((permission) => permission !== "manage_budget"),
  Producer: [
    "view_projects",
    "edit_projects",
    "create_tasks",
    "delete_tasks",
    "view_files",
    "upload_files",
    "manage_calendar",
    "manage_bookings",
    "manage_clients"
  ],
  Editor: [
    "view_projects",
    "create_tasks",
    "view_files",
    "upload_files",
    "manage_storyboards"
  ],
  Client: ["view_projects", "view_files"],
  Custom: []
};

export const POSITION_SUGGESTIONS = [
  "Owner",
  "Admin",
  "Producer",
  "Director",
  "Editor",
  "Videographer",
  "Photographer",
  "Writer",
  "Designer",
  "Social Media",
  "Client",
  "Intern"
];
