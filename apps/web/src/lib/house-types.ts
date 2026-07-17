export const HOUSE_TYPES = [
  "freelancer",
  "agency",
  "college",
  "hobbyist",
  "custom"
] as const;

export type HouseType = (typeof HOUSE_TYPES)[number];

export const HOUSE_TYPE_INFO: Record<
  HouseType,
  { label: string; description: string }
> = {
  freelancer: {
    label: "Freelancer / Solo",
    description:
      "Built for individuals managing their own projects and clients."
  },
  agency: {
    label: "Agency / Production House",
    description: "For teams working together on productions and client work."
  },
  college: {
    label: "College Club / Group",
    description: "Perfect for student clubs, film societies, and campus teams."
  },
  hobbyist: {
    label: "Hobbyists",
    description: "For friends and creators making projects for fun."
  },
  custom: {
    label: "Custom (All Features)",
    description: "Starts with every module enabled with no predefined niche."
  }
};

export const ALL_MODULE_IDS = [
  "home",
  "projects",
  "calendar",
  "tasks",
  "review",
  "crews",
  "files",
  "storyboard",
  "scripts",
  "messages",
  "bookings",
  "announcements",
  "analytics",
  "settings"
] as const;

export const HOUSE_TYPE_DEFAULT_MODULES: Record<HouseType, string[]> = {
  freelancer: [
    "home",
    "projects",
    "calendar",
    "tasks",
    "files",
    "storyboard",
    "scripts",
    "bookings",
    "analytics",
    "settings"
  ],
  agency: [...ALL_MODULE_IDS],
  college: [
    "home",
    "projects",
    "calendar",
    "tasks",
    "crews",
    "files",
    "storyboard",
    "scripts",
    "messages",
    "announcements",
    "settings"
  ],
  hobbyist: [
    "home",
    "projects",
    "calendar",
    "tasks",
    "files",
    "storyboard",
    "scripts",
    "messages",
    "settings"
  ],
  custom: [...ALL_MODULE_IDS]
};

// Never toggleable and always visible regardless of enabledModules.
export const ALWAYS_ENABLED_MODULES = ["home", "settings"];
