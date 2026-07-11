"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DashboardProjectCard } from "@/components/dashboard/project-card";
import { listProjects } from "@/services/base-workspace.service";
import type { Project } from "@/types/base";

export function RecentProjectsPanel() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    let cancelled = false;

    listProjects()
      .then((data) => {
        if (!cancelled) {
          setProjects(data.slice(0, 6));
        }
      })
      .catch(() => {
        // Dashboard panel fails quietly - the Projects page surfaces the error.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardPanel
      action={{ label: "View all", onClick: () => router.push("/projects") }}
      title="Recent Projects"
    >
      <div className="flex items-center gap-3 p-4">
        <div className="flex min-w-0 flex-1 gap-4 overflow-x-auto pb-1">
          {projects.length > 0 ? (
            projects.map((project) => (
              <DashboardProjectCard key={project.id} project={project} />
            ))
          ) : (
            <p className="py-6 text-sm text-[#8a90a3]">No projects yet.</p>
          )}
        </div>
        <button
          aria-label="Show more projects"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black/10 text-[#4b5268] hover:bg-black/[0.03]"
          onClick={() => router.push("/projects")}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </DashboardPanel>
  );
}
