export type BoardTemplate = {
  id: string;
  name: string;
  description: string;
  frameCount: number;
};

// These are built-in starting-point templates, not user data, so they stay
// as app config rather than needing their own Prisma model (unlike
// Characters/Locations, which are now real per-house data - see
// server/storyboard/storyboard.service.ts).
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
