"use client";

import { useEffect, useMemo, useState } from "react";
import { usePresence } from "@/lib/realtime/use-presence";
import { useWorkspace } from "@/lib/workspace-context";
import { usePrompt } from "@/components/ui/prompt-dialog";
import {
  archiveClient,
  archiveProject,
  createClient,
  createProject,
  deleteClient,
  listClients,
  listProjects,
  updateClient
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
import { ClientCard } from "@/components/projects/client-card";
import { ClientEditDialog } from "@/components/projects/client-edit-dialog";
import {
  PROJECT_TYPES,
  type Project
} from "@/components/projects/project-data";
import type { ClientItem, CreateClientRequest } from "@/types/base";

export function ProjectsPage() {
  const { workspace, activeHouse } = useWorkspace();
  const members = useMemo(() => activeHouse?.members ?? [], [activeHouse]);
  const onlineUserIds = usePresence(
    activeHouse?.id ?? null,
    workspace.user.id,
    workspace.user.name
  );
  const prompt = usePrompt();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProjectTab>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeTypes, setActiveTypes] = useState<Set<string>>(
    () => new Set(PROJECT_TYPES)
  );

  const [clients, setClients] = useState<ClientItem[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);

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

  useEffect(() => {
    let cancelled = false;

    listClients()
      .then((data) => {
        if (!cancelled) {
          setClients(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          window.alert(
            error instanceof Error ? error.message : "Could not load clients."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setClientsLoading(false);
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
        priority: source.priority,
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
    const title = await prompt("Name your new project");

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

  async function handleClientSave(request: CreateClientRequest) {
    if (editingClient) {
      const updated = await updateClient(editingClient.id, request);
      setClients((current) =>
        current.map((client) => (client.id === updated.id ? updated : client))
      );
    } else {
      const created = await createClient(request);
      setClients((current) => [created, ...current]);
    }
  }

  async function handleArchiveClient(clientId: string) {
    try {
      await archiveClient(clientId);
      setClients((current) => current.filter((c) => c.id !== clientId));
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not archive the client."
      );
    }
  }

  async function handleDeleteClient(clientId: string) {
    if (!window.confirm("Delete this client? This cannot be undone.")) {
      return;
    }
    try {
      await deleteClient(clientId);
      setClients((current) => current.filter((c) => c.id !== clientId));
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not delete the client."
      );
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:p-8">
      <ProjectsHeader
        onNewClient={() => {
          setEditingClient(null);
          setClientDialogOpen(true);
        }}
        onNewProject={handleNewProject}
      />

      <h2 className="text-lg font-black text-[#11142c] dark:text-[#f1f2f8]">
        Projects
      </h2>
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
              onlineUserIds={onlineUserIds}
              project={project}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
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

      <h2 className="mt-2 text-lg font-black text-[#11142c] dark:text-[#f1f2f8]">
        Clients
      </h2>
      {!clientsLoading && clients.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-2xl border border-black/[0.06] bg-white p-16 text-center dark:border-white/[0.08] dark:bg-[#171a28]">
          <p className="text-sm text-[#667085] dark:text-[#7d8299]">
            No clients yet. Add one to start tracking work directly for them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {clients.map((client) => (
            <ClientCard
              client={client}
              key={client.id}
              onArchive={() => handleArchiveClient(client.id)}
              onDelete={() => handleDeleteClient(client.id)}
              onEdit={() => {
                setEditingClient(client);
                setClientDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
        <ProjectTimelinePanel />
        <RecentActivityPanel />
      </div>

      <ClientEditDialog
        client={editingClient}
        onOpenChange={setClientDialogOpen}
        onSave={handleClientSave}
        open={clientDialogOpen}
      />
    </div>
  );
}
