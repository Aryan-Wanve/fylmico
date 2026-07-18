"use client";

import { useEffect, useRef, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import {
  Building2,
  FolderKanban,
  ListChecks,
  Search,
  Users
} from "lucide-react";
import { useWorkspace } from "@/lib/workspace-context";
import { listClients, listProjects } from "@/services/base-workspace.service";
import type { ClientItem, Project } from "@/types/base";

type SearchResult = {
  id: string;
  label: string;
  sublabel: string;
  icon: typeof FolderKanban;
  href: string;
};

export function GlobalSearch() {
  const { workspace, activeHouse } = useWorkspace();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .catch(() => {
        // Search degrades to tasks/people if projects fail to load.
      });
    listClients()
      .then(setClients)
      .catch(() => {
        // Search degrades if clients fail to load.
      });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trimmed = query.trim().toLowerCase();

  const results: SearchResult[] = trimmed
    ? [
        ...projects
          .filter((project) => project.title.toLowerCase().includes(trimmed))
          .slice(0, 4)
          .map((project) => ({
            id: `project-${project.id}`,
            label: project.title,
            sublabel: "Project",
            icon: FolderKanban,
            href: `/projects/${project.id}`
          })),
        ...clients
          .filter((client) => client.name.toLowerCase().includes(trimmed))
          .slice(0, 4)
          .map((client) => ({
            id: `client-${client.id}`,
            label: client.name,
            sublabel: "Client",
            icon: Building2,
            href: `/projects/clients/${client.id}`
          })),
        ...workspace.tasks
          .filter((task) => task.title.toLowerCase().includes(trimmed))
          .slice(0, 4)
          .map((task) => ({
            id: `task-${task.id}`,
            label: task.title,
            sublabel: "Task",
            icon: ListChecks,
            href: "/tasks" as const
          })),
        ...(activeHouse?.members ?? [])
          .filter((member) => member.name.toLowerCase().includes(trimmed))
          .slice(0, 4)
          .map((member) => ({
            id: `member-${member.id}`,
            label: member.name,
            sublabel: "Crew member",
            icon: Users,
            href: "/crews" as const
          }))
      ]
    : [];

  function handleSelect(result: SearchResult) {
    setQuery("");
    setOpen(false);
    router.push(result.href as Route);
  }

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <div className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-black/10 bg-white px-3.5 dark:border-white/10 dark:bg-[#171a28]">
        <Search className="h-4 w-4 shrink-0 text-[#8a90a3] dark:text-[#7d8299]" />
        <input
          className="h-full flex-1 bg-transparent text-sm text-[#12142b] outline-none placeholder:text-[#9296a4] dark:text-[#f1f2f8] dark:placeholder:text-[#7d8299]"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search projects, tasks, people..."
          type="search"
          value={query}
        />
      </div>

      {open && trimmed ? (
        <div className="absolute top-full left-0 z-30 mt-2 w-full overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.12)] dark:border-white/10 dark:bg-[#171a28]">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[#8a90a3] dark:text-[#7d8299]">
              No matches for &ldquo;{query.trim()}&rdquo;
            </p>
          ) : (
            <ul>
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                    onClick={() => handleSelect(result)}
                    type="button"
                  >
                    <result.icon className="h-4 w-4 shrink-0 text-[#8a90a3] dark:text-[#7d8299]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#12142b] dark:text-[#f1f2f8]">
                        {result.label}
                      </span>
                      <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                        {result.sublabel}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
