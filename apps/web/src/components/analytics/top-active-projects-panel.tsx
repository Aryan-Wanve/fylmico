import Image from "next/image";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { topActiveProjects } from "@/components/analytics/analytics-data";

const TONE_COLOR: Record<"violet" | "blue" | "green" | "orange", string> = {
  violet: "bg-[#654cff]",
  blue: "bg-[#3b82f6]",
  green: "bg-[#16c784]",
  orange: "bg-[#f97316]"
};

export function TopActiveProjectsPanel() {
  return (
    <DashboardPanel action={{ label: "View all" }} title="Top Active Projects">
      <div className="grid gap-1 p-2">
        {topActiveProjects.map((project) => (
          <div
            className="flex items-center gap-3 rounded-xl p-2 hover:bg-black/[0.02]"
            key={project.id}
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
              <Image
                alt=""
                className="object-cover"
                fill
                sizes="40px"
                src={project.image}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${TONE_COLOR[project.tone]}`}
                />
                <strong className="truncate text-sm font-semibold text-[#11142c]">
                  {project.title}
                </strong>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className={`h-full rounded-full ${TONE_COLOR[project.tone]}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
            <span className="shrink-0 text-xs font-bold text-[#5f667d]">
              {project.progress}%
            </span>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}
