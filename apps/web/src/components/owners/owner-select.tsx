"use client";

import { useEffect, useState } from "react";
import { Building2, FolderKanban } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { listClients, listProjects } from "@/services/base-workspace.service";
import type { ClientItem, OwnerType, Project } from "@/types/base";

export type OwnerValue = { ownerType: OwnerType; ownerId: string };

// The single owner picker used everywhere a piece of work is created or
// reassigned (ADR 0059): pick Project or Client, then the entity. Every
// task/deliverable/shoot/event resolves to exactly one owner through this.
export function OwnerSelect({
  value,
  onChange,
  disabled
}: {
  value: OwnerValue | null;
  onChange: (value: OwnerValue | null) => void;
  disabled?: boolean;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [ownerType, setOwnerType] = useState<OwnerType>(
    value?.ownerType ?? "project"
  );

  useEffect(() => {
    Promise.all([listProjects(), listClients()])
      .then(([projectList, clientList]) => {
        setProjects(projectList);
        setClients(clientList);
      })
      .catch(() => {
        // The picker just shows fewer options if this fails.
      });
  }, []);

  const entities =
    ownerType === "project"
      ? projects.map((p) => ({ id: p.id, name: p.title }))
      : clients.map((c) => ({ id: c.id, name: c.name }));

  function switchType(next: OwnerType) {
    setOwnerType(next);
    onChange(null);
  }

  return (
    <div className="grid gap-2">
      <div className="flex gap-1.5">
        {(["project", "client"] as const).map((type) => {
          const active = ownerType === type;
          const Icon = type === "project" ? FolderKanban : Building2;
          return (
            <button
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold ${
                active
                  ? "bg-[#654cff] text-white"
                  : "bg-black/[0.04] text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]"
              }`}
              disabled={disabled}
              key={type}
              onClick={() => switchType(type)}
              type="button"
            >
              <Icon className="h-3.5 w-3.5" />
              {type === "project" ? "Project" : "Client"}
            </button>
          );
        })}
      </div>

      <Select
        disabled={disabled || entities.length === 0}
        items={{
          none: ownerType === "project" ? "Select project" : "Select client",
          ...Object.fromEntries(entities.map((e) => [e.id, e.name]))
        }}
        onValueChange={(next) =>
          onChange(
            next && next !== "none" ? { ownerType, ownerId: next } : null
          )
        }
        value={value?.ownerId ?? "none"}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            {ownerType === "project"
              ? entities.length === 0
                ? "No projects yet"
                : "Select project"
              : entities.length === 0
                ? "No clients yet"
                : "Select client"}
          </SelectItem>
          {entities.map((entity) => (
            <SelectItem key={entity.id} value={entity.id}>
              {entity.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
