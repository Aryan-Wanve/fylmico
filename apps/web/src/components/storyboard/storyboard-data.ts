import {
  Building2,
  Car,
  Compass,
  Droplet,
  DoorOpen,
  Footprints,
  Gem,
  Hand,
  Home,
  Moon,
  Sun,
  User,
  Users,
  type LucideIcon
} from "lucide-react";

export type ShotType = "WS" | "MS" | "CU" | "LS" | "OTS" | "INT";

export const SHOT_TYPE_LABELS: Record<ShotType, string> = {
  WS: "Wide Shot",
  MS: "Medium Shot",
  CU: "Close Up",
  LS: "Long Shot",
  OTS: "Over the Shoulder",
  INT: "Interior"
};

export type Shot = {
  id: string;
  number: string;
  description: string;
  shotType: ShotType;
  durationSec: number;
  camera: string;
  lensMovement: string;
  tags: string[];
  attachedFiles: Array<{ name: string; size: string }>;
  icon: LucideIcon;
};

export type Board = {
  id: string;
  name: string;
  badge?: string;
  updatedLabel: string;
  shots: Shot[];
};

export type Character = {
  id: string;
  name: string;
  role: string;
  description: string;
};

export type StoryLocation = {
  id: string;
  name: string;
  type: string;
  shotCount: number;
};

export type BoardTemplate = {
  id: string;
  name: string;
  description: string;
  frameCount: number;
};

function cameraLabel(type: ShotType): string {
  return `${SHOT_TYPE_LABELS[type]} (${type})`;
}

export const boards: Board[] = [
  {
    id: "main-storyboard",
    name: "Main Storyboard",
    badge: "Main",
    updatedLabel: "2 hours ago",
    shots: [
      {
        id: "shot-1-1",
        number: "1.1",
        description: "Establishing shot of the city at dawn.",
        shotType: "WS",
        durationSec: 5,
        camera: cameraLabel("WS"),
        lensMovement: "Drone • Slow Push In",
        tags: ["Establishing", "City"],
        attachedFiles: [
          { name: "Location_Reference.jpg", size: "2.4 MB" },
          { name: "Moodboard_Dawn.png", size: "3.1 MB" }
        ],
        icon: Building2
      },
      {
        id: "shot-1-2",
        number: "1.2",
        description: "Character looks out of the window.",
        shotType: "MS",
        durationSec: 4,
        camera: cameraLabel("MS"),
        lensMovement: "Tripod • Static",
        tags: ["Character"],
        attachedFiles: [],
        icon: User
      },
      {
        id: "shot-1-3",
        number: "1.3",
        description: "Close up of the locket.",
        shotType: "CU",
        durationSec: 3,
        camera: cameraLabel("CU"),
        lensMovement: "Macro • Static",
        tags: ["Prop", "Emotional"],
        attachedFiles: [],
        icon: Gem
      },
      {
        id: "shot-1-4",
        number: "1.4",
        description: "He takes a deep breath.",
        shotType: "MS",
        durationSec: 4,
        camera: cameraLabel("MS"),
        lensMovement: "Handheld • Static",
        tags: ["Character", "Emotional"],
        attachedFiles: [],
        icon: User
      },
      {
        id: "shot-2-1",
        number: "2.1",
        description: "Walking through empty streets.",
        shotType: "LS",
        durationSec: 5,
        camera: cameraLabel("LS"),
        lensMovement: "Steadicam • Tracking",
        tags: ["City"],
        attachedFiles: [],
        icon: Footprints
      },
      {
        id: "shot-2-2",
        number: "2.2",
        description: "Over the shoulder conversation.",
        shotType: "OTS",
        durationSec: 6,
        camera: cameraLabel("OTS"),
        lensMovement: "Tripod • Static",
        tags: ["Dialogue"],
        attachedFiles: [],
        icon: Users
      },
      {
        id: "shot-2-3",
        number: "2.3",
        description: "His expression changes.",
        shotType: "CU",
        durationSec: 3,
        camera: cameraLabel("CU"),
        lensMovement: "Tripod • Static",
        tags: ["Emotional"],
        attachedFiles: [],
        icon: User
      },
      {
        id: "shot-3-1",
        number: "3.1",
        description: "Car drives towards the hills.",
        shotType: "WS",
        durationSec: 5,
        camera: cameraLabel("WS"),
        lensMovement: "Drone • Follow",
        tags: ["Establishing"],
        attachedFiles: [],
        icon: Car
      },
      {
        id: "shot-3-2",
        number: "3.2",
        description: "Inside the old apartment.",
        shotType: "INT",
        durationSec: 4,
        camera: cameraLabel("INT"),
        lensMovement: "Tripod • Static",
        tags: ["Interior"],
        attachedFiles: [],
        icon: Home
      },
      {
        id: "shot-3-3",
        number: "3.3",
        description: "She hesitates at the door.",
        shotType: "MS",
        durationSec: 3,
        camera: cameraLabel("MS"),
        lensMovement: "Handheld • Static",
        tags: ["Character"],
        attachedFiles: [],
        icon: DoorOpen
      },
      {
        id: "shot-3-4",
        number: "3.4",
        description: "Hand reaching for the handle.",
        shotType: "CU",
        durationSec: 2,
        camera: cameraLabel("CU"),
        lensMovement: "Macro • Static",
        tags: ["Prop"],
        attachedFiles: [],
        icon: Hand
      },
      {
        id: "shot-4-1",
        number: "4.1",
        description: "Rooftop view at sunset.",
        shotType: "WS",
        durationSec: 6,
        camera: cameraLabel("WS"),
        lensMovement: "Drone • Orbit",
        tags: ["Establishing", "Emotional"],
        attachedFiles: [],
        icon: Sun
      },
      {
        id: "shot-4-2",
        number: "4.2",
        description: "Two friends sit in silence.",
        shotType: "MS",
        durationSec: 5,
        camera: cameraLabel("MS"),
        lensMovement: "Tripod • Static",
        tags: ["Dialogue", "Emotional"],
        attachedFiles: [],
        icon: Users
      },
      {
        id: "shot-4-3",
        number: "4.3",
        description: "A single tear falls.",
        shotType: "CU",
        durationSec: 2,
        camera: cameraLabel("CU"),
        lensMovement: "Macro • Static",
        tags: ["Emotional"],
        attachedFiles: [],
        icon: Droplet
      },
      {
        id: "shot-4-4",
        number: "4.4",
        description: "Walking away into the crowd.",
        shotType: "LS",
        durationSec: 4,
        camera: cameraLabel("LS"),
        lensMovement: "Steadicam • Tracking",
        tags: ["City"],
        attachedFiles: [],
        icon: Users
      },
      {
        id: "shot-5-1",
        number: "5.1",
        description: "Final shot of the skyline at night.",
        shotType: "WS",
        durationSec: 5,
        camera: cameraLabel("WS"),
        lensMovement: "Drone • Slow Pull Out",
        tags: ["Establishing", "City"],
        attachedFiles: [],
        icon: Moon
      }
    ]
  },
  {
    id: "opening-sequence",
    name: "Opening Sequence",
    updatedLabel: "1 day ago",
    shots: [
      {
        id: "open-1",
        number: "O.1",
        description: "Title card fades in over black.",
        shotType: "INT",
        durationSec: 3,
        camera: cameraLabel("INT"),
        lensMovement: "Static",
        tags: ["Title"],
        attachedFiles: [],
        icon: Moon
      },
      {
        id: "open-2",
        number: "O.2",
        description: "Sun rises over the harbor.",
        shotType: "WS",
        durationSec: 5,
        camera: cameraLabel("WS"),
        lensMovement: "Drone • Slow Push In",
        tags: ["Establishing"],
        attachedFiles: [],
        icon: Sun
      },
      {
        id: "open-3",
        number: "O.3",
        description: "Fishermen prepare their boats.",
        shotType: "MS",
        durationSec: 4,
        camera: cameraLabel("MS"),
        lensMovement: "Handheld",
        tags: ["Character"],
        attachedFiles: [],
        icon: Users
      },
      {
        id: "open-4",
        number: "O.4",
        description: "Compass on the dashboard.",
        shotType: "CU",
        durationSec: 2,
        camera: cameraLabel("CU"),
        lensMovement: "Macro • Static",
        tags: ["Prop"],
        attachedFiles: [],
        icon: Compass
      },
      {
        id: "open-5",
        number: "O.5",
        description: "Boat departs into open water.",
        shotType: "LS",
        durationSec: 6,
        camera: cameraLabel("LS"),
        lensMovement: "Drone • Follow",
        tags: ["Establishing"],
        attachedFiles: [],
        icon: Compass
      }
    ]
  },
  {
    id: "dream-sequence",
    name: "Dream Sequence",
    updatedLabel: "2 days ago",
    shots: [
      {
        id: "dream-1",
        number: "D.1",
        description: "Blurred memories flash by.",
        shotType: "CU",
        durationSec: 2,
        camera: cameraLabel("CU"),
        lensMovement: "Handheld • Whip Pan",
        tags: ["Emotional"],
        attachedFiles: [],
        icon: Droplet
      },
      {
        id: "dream-2",
        number: "D.2",
        description: "Childhood home, seen from outside.",
        shotType: "WS",
        durationSec: 4,
        camera: cameraLabel("WS"),
        lensMovement: "Static",
        tags: ["Establishing"],
        attachedFiles: [],
        icon: Home
      },
      {
        id: "dream-3",
        number: "D.3",
        description: "A door opens to bright light.",
        shotType: "MS",
        durationSec: 3,
        camera: cameraLabel("MS"),
        lensMovement: "Static",
        tags: ["Symbolic"],
        attachedFiles: [],
        icon: DoorOpen
      },
      {
        id: "dream-4",
        number: "D.4",
        description: "He wakes up, startled.",
        shotType: "CU",
        durationSec: 2,
        camera: cameraLabel("CU"),
        lensMovement: "Handheld",
        tags: ["Character"],
        attachedFiles: [],
        icon: User
      }
    ]
  },
  {
    id: "climax-sequence",
    name: "Climax Sequence",
    updatedLabel: "3 days ago",
    shots: [
      {
        id: "climax-1",
        number: "C.1",
        description: "Storm clouds gather over the hills.",
        shotType: "WS",
        durationSec: 5,
        camera: cameraLabel("WS"),
        lensMovement: "Drone • Static",
        tags: ["Establishing"],
        attachedFiles: [],
        icon: Sun
      },
      {
        id: "climax-2",
        number: "C.2",
        description: "The confrontation begins.",
        shotType: "OTS",
        durationSec: 6,
        camera: cameraLabel("OTS"),
        lensMovement: "Handheld",
        tags: ["Dialogue"],
        attachedFiles: [],
        icon: Users
      },
      {
        id: "climax-3",
        number: "C.3",
        description: "A hand trembles on the door handle.",
        shotType: "CU",
        durationSec: 2,
        camera: cameraLabel("CU"),
        lensMovement: "Macro",
        tags: ["Prop", "Emotional"],
        attachedFiles: [],
        icon: Hand
      },
      {
        id: "climax-4",
        number: "C.4",
        description: "Truth comes out.",
        shotType: "CU",
        durationSec: 4,
        camera: cameraLabel("CU"),
        lensMovement: "Static",
        tags: ["Emotional"],
        attachedFiles: [],
        icon: User
      }
    ]
  },
  {
    id: "ending-sequence",
    name: "Ending Sequence",
    updatedLabel: "5 days ago",
    shots: [
      {
        id: "ending-1",
        number: "E.1",
        description: "Quiet reconciliation on the porch.",
        shotType: "MS",
        durationSec: 5,
        camera: cameraLabel("MS"),
        lensMovement: "Static",
        tags: ["Emotional"],
        attachedFiles: [],
        icon: Users
      },
      {
        id: "ending-2",
        number: "E.2",
        description: "Sun sets behind the skyline.",
        shotType: "WS",
        durationSec: 6,
        camera: cameraLabel("WS"),
        lensMovement: "Drone • Slow Pull Out",
        tags: ["Establishing"],
        attachedFiles: [],
        icon: Sun
      },
      {
        id: "ending-3",
        number: "E.3",
        description: "Final fade to black.",
        shotType: "INT",
        durationSec: 3,
        camera: cameraLabel("INT"),
        lensMovement: "Static",
        tags: ["Title"],
        attachedFiles: [],
        icon: Moon
      }
    ]
  },
  {
    id: "reference-board",
    name: "Reference Board",
    updatedLabel: "1 week ago",
    shots: [
      {
        id: "ref-1",
        number: "R.1",
        description: "Reference: city skyline lighting mood.",
        shotType: "WS",
        durationSec: 0,
        camera: cameraLabel("WS"),
        lensMovement: "—",
        tags: ["Reference"],
        attachedFiles: [],
        icon: Building2
      },
      {
        id: "ref-2",
        number: "R.2",
        description: "Reference: costume palette for lead.",
        shotType: "CU",
        durationSec: 0,
        camera: cameraLabel("CU"),
        lensMovement: "—",
        tags: ["Reference"],
        attachedFiles: [],
        icon: User
      },
      {
        id: "ref-3",
        number: "R.3",
        description: "Reference: apartment interior style.",
        shotType: "INT",
        durationSec: 0,
        camera: cameraLabel("INT"),
        lensMovement: "—",
        tags: ["Reference"],
        attachedFiles: [],
        icon: Home
      },
      {
        id: "ref-4",
        number: "R.4",
        description: "Reference: night driving sequence.",
        shotType: "LS",
        durationSec: 0,
        camera: cameraLabel("LS"),
        lensMovement: "—",
        tags: ["Reference"],
        attachedFiles: [],
        icon: Car
      }
    ]
  }
];

export const characters: Character[] = [
  {
    id: "char-1",
    name: "Mira Kapoor",
    role: "Lead",
    description: "A filmmaker searching for her voice after a decade away."
  },
  {
    id: "char-2",
    name: "Dev Anand",
    role: "Supporting",
    description: "Mira's estranged mentor, now running a small studio."
  },
  {
    id: "char-3",
    name: "Sana Iqbal",
    role: "Supporting",
    description: "Mira's childhood friend and unofficial producer."
  },
  {
    id: "char-4",
    name: "The City",
    role: "Motif",
    description: "Recurring establishing shots that track the passage of time."
  }
];

export const storyLocations: StoryLocation[] = [
  { id: "loc-1", name: "Downtown Skyline", type: "Exterior", shotCount: 4 },
  { id: "loc-2", name: "Mira's Apartment", type: "Interior", shotCount: 3 },
  { id: "loc-3", name: "Harbor Docks", type: "Exterior", shotCount: 5 },
  { id: "loc-4", name: "Old Studio", type: "Interior", shotCount: 2 },
  { id: "loc-5", name: "Rooftop", type: "Exterior", shotCount: 2 }
];

export const boardTemplates: BoardTemplate[] = [
  {
    id: "template-1",
    name: "3-Act Sequence",
    description: "A classic setup, confrontation, resolution structure.",
    frameCount: 12
  },
  {
    id: "template-2",
    name: "Commercial 30s",
    description: "Fast-paced template for short-form brand spots.",
    frameCount: 8
  },
  {
    id: "template-3",
    name: "Music Video",
    description: "Rhythmic cutting template synced to a 4-beat structure.",
    frameCount: 16
  },
  {
    id: "template-4",
    name: "Documentary Interview",
    description: "Talking-head coverage with cutaway placeholders.",
    frameCount: 6
  }
];
