"use client";

import { useMemo, useState } from "react";
import { ProjectsHeader } from "@/components/projects/projects-header";
import {
  ProjectsToolbar,
  type ProjectTab,
  type ViewMode
} from "@/components/projects/projects-toolbar";
import { ProjectGridCard } from "@/components/projects/project-grid-card";
import { ProjectListRow } from "@/components/projects/project-list-row";
import { ProjectsEmptyState } from "@/components/projects/projects-empty-state";
import { ProjectTimelinePanel } from "@/components/projects/project-timeline-panel";
import { RecentActivityPanel } from "@/components/dashboard/recent-activity-panel";
import {
  projects as defaultProjects,
  PROJECT_TYPES,
  type Project
} from "@/components/projects/project-data";

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [activeTab, setActiveTab] = useState<ProjectTab>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeTypes, setActiveTypes] = useState<Set<string>>(
    () => new Set(PROJECT_TYPES)
  );

  const counts = useMemo(() => {
    return {
      all: projects.length,
      active: projects.filter((project) => project.status === "active").length,
      "in-progress": projects.filter(
        (project) => project.status === "in-progress"
      ).length,
      "on-hold": projects.filter((project) => project.status === "on-hold")
        .length,
      completed: projects.filter((project) => project.status === "completed")
        .length
    };
  }, [projects]);

  const filteredProjects = projects.filter((project) => {
    const matchesTab = activeTab === "all" || project.status === activeTab;
    const matchesType = activeTypes.has(project.type);
    return matchesTab && matchesType;
  });

  function handleToggleType(type: string) {
    setActiveTypes((current) => {
      const next = new Set(current);

      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }

      return next;
    });
  }

  function handleDuplicate(projectId: string) {
    setProjects((current) => {
      const source = current.find((project) => project.id === projectId);

      if (!source) {
        return current;
      }

      const index = current.indexOf(source);
      const copy: Project = {
        ...source,
        id: `${source.id}-copy-${Date.now()}`,
        title: `${source.title} (Copy)`
      };
      const next = [...current];
      next.splice(index + 1, 0, copy);
      return next;
    });
  }

  function handleArchive(projectId: string) {
    setProjects((current) =>
      current.filter((project) => project.id !== projectId)
    );
  }

  function handleNewProject() {
    const title = window.prompt("Name your new project");

    if (!title || !title.trim()) {
      return;
    }

    const project: Project = {
      id: `project-${Date.now()}`,
      title: title.trim(),
      type: "Short Film",
      genre: "New",
      description: "A new production ready to move into pre-production.",
      stage: "Development",
      status: "active",
      progress: 0,
      coverGradient: "from-slate-400 via-slate-600 to-slate-800",
      dueDate: "TBD",
      teamIds: ["user-aryan"],
      teamOverflow: 0
    };

    setProjects((current) => [project, ...current]);
    setActiveTab("all");
  }

  return (
    <div className="grid gap-6 p-8">
      <ProjectsHeader onNewProject={handleNewProject} />
      <ProjectsToolbar
        activeTab={activeTab}
        activeTypes={activeTypes}
        counts={counts}
        onTabChange={setActiveTab}
        onToggleType={handleToggleType}
        onViewModeChange={setViewMode}
        viewMode={viewMode}
      />

      {filteredProjects.length === 0 ? (
        <ProjectsEmptyState />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {filteredProjects.map((project) => (
            <ProjectGridCard
              key={project.id}
              onArchive={() => handleArchive(project.id)}
              onDuplicate={() => handleDuplicate(project.id)}
              project={project}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
          {filteredProjects.map((project) => (
            <ProjectListRow
              key={project.id}
              onArchive={() => handleArchive(project.id)}
              onDuplicate={() => handleDuplicate(project.id)}
              project={project}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
        <ProjectTimelinePanel />
        <RecentActivityPanel />
      </div>
    </div>
  );
}
