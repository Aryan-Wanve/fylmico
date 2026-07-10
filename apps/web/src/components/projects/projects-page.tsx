"use client";

import { useEffect, useMemo, useState } from "react";
import { useWorkspace } from "@/lib/workspace-context";
import {
  archiveProject,
  createProject,
  listProjects
} from "@/services/base-workspace.service";
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
  PROJECT_TYPES,
  type Project
} from "@/components/projects/project-data";

export function ProjectsPage() {
  const { activeHouse } = useWorkspace();
  const members = useMemo(() => activeHouse?.members ?? [], [activeHouse]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProjectTab>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeTypes, setActiveTypes] = useState<Set<string>>(
    () => new Set(PROJECT_TYPES)
  );

  useEffect(() => {
    let cancelled = false;

    listProjects()
      .then((data) => {
        if (!cancelled) {
          setProjects(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          window.alert(
            error instanceof Error ? error.message : "Could not load projects."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
    const matchesType = !project.type || activeTypes.has(project.type);
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

  async function handleDuplicate(projectId: string) {
    const source = projects.find((project) => project.id === projectId);
    if (!source) {
      return;
    }

    try {
      const copy = await createProject({
        name: `${source.title} (Copy)`,
        description: source.description ?? undefined,
        type: source.type ?? undefined,
        genre: source.genre ?? undefined,
        stage: source.stage,
        progress: source.progress,
        coverGradient: source.coverGradient ?? undefined,
        coverIcon: source.coverIcon ?? undefined,
        dueDate: source.dueDate ?? undefined,
        teamIds: source.teamIds
      });
      setProjects((current) => {
        const index = current.indexOf(source);
        const next = [...current];
        next.splice(index + 1, 0, copy);
        return next;
      });
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not duplicate the project."
      );
    }
  }

  async function handleArchive(projectId: string) {
    try {
      await archiveProject(projectId);
      setProjects((current) =>
        current.filter((project) => project.id !== projectId)
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not archive the project."
      );
    }
  }

  async function handleNewProject() {
    const title = window.prompt("Name your new project");

    if (!title || !title.trim()) {
      return;
    }

    try {
      const project = await createProject({
        name: title.trim(),
        description: "A new production ready to move into pre-production.",
        stage: "Development",
        coverGradient: "from-slate-400 via-slate-600 to-slate-800"
      });
      setProjects((current) => [project, ...current]);
      setActiveTab("all");
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not create the project."
      );
    }
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

      {!loading && filteredProjects.length === 0 ? (
        <ProjectsEmptyState />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {filteredProjects.map((project) => (
            <ProjectGridCard
              key={project.id}
              members={members}
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
              members={members}
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
