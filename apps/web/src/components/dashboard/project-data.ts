export type ProjectItem = {
  id: string;
  title: string;
  type: string;
  progress: number;
  image: string;
};

export const recentProjects: ProjectItem[] = [
  {
    id: "beyond-frames",
    title: "Beyond Frames",
    type: "Short Film",
    progress: 68,
    image: "/images/dashboard/project-beyond-frames.jpg"
  },
  {
    id: "wanderers",
    title: "Wanderers",
    type: "Documentary",
    progress: 42,
    image: "/images/dashboard/project-wanderers.jpg"
  },
  {
    id: "lumea",
    title: "Lumea Ad Campaign",
    type: "Commercial",
    progress: 75,
    image: "/images/dashboard/project-lumea.jpg"
  },
  {
    id: "echoes",
    title: "Echoes",
    type: "Music Video",
    progress: 30,
    image: "/images/dashboard/project-echoes.jpg"
  }
];
