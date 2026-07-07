import { ChevronRight } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { ProjectCard } from "@/components/dashboard/project-card";
import { recentProjects } from "@/components/dashboard/project-data";

export function RecentProjectsPanel() {
  return (
    <DashboardPanel action={{ label: "View all" }} title="Recent Projects">
      <div className="flex items-center gap-3 p-4">
        <div className="flex min-w-0 flex-1 gap-4 overflow-x-auto pb-1">
          {recentProjects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
        <button
          aria-label="Show more projects"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black/10 text-[#4b5268] hover:bg-black/[0.03]"
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </DashboardPanel>
  );
}
