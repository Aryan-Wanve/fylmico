export const authFeatures: Array<{
  icon: string;
  title: string;
  body: string;
}> = [
  {
    icon: "/images/login/calendar.png",
    title: "Plan & Schedule",
    body: "Organize shoots and deadlines"
  },
  {
    icon: "/images/login/team.png",
    title: "Manage Teams",
    body: "Assign roles and collaborate"
  },
  {
    icon: "/images/login/folder.png",
    title: "Store & Share",
    body: "Keep files, notes and assets safe"
  },
  {
    icon: "/images/login/progress.png",
    title: "Track Progress",
    body: "Stay updated and deliver on time"
  }
];

export const authSocialProviders: Array<{
  id: string;
  label: string;
  icon: string;
}> = [{ id: "google", label: "Google", icon: "/images/login/google.png" }];
