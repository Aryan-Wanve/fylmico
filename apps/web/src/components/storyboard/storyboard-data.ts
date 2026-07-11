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

// Characters, locations, and templates are still illustrative placeholders -
// they need their own Prisma models before they can be wired to real data.
// Deferred past the boards/shots MVP (see ADR for this pass).
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
