"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { ClientItem, Project, UploadCategory } from "@/types/base";

const selectClassName =
  "h-10 w-full rounded-lg border border-black/10 bg-transparent px-3 text-sm text-[#11142c] outline-none focus:border-[#654cff] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]";

const CATEGORIES: { value: UploadCategory; label: string }[] = [
  { value: "raw", label: "Raw Footage" },
  { value: "assets", label: "Asset" },
  { value: "deliverables", label: "Deliverable" },
  { value: "project-files", label: "Project File" }
];

export function UploadDestinationDialog({
  open,
  onOpenChange,
  clients,
  projects,
  onConfirm
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: ClientItem[];
  projects: Project[];
  onConfirm: (destination: {
    clientId: string;
    projectId?: string;
    category: UploadCategory;
  }) => void;
}) {
  const [clientId, setClientId] = useState("misc");
  const [projectId, setProjectId] = useState("");
  const [category, setCategory] = useState<UploadCategory>("project-files");

  const projectsForClient =
    clientId === "misc"
      ? []
      : projects.filter((project) =>
          project.clients.some((client) => client.id === clientId)
        );

  function reset() {
    setClientId("misc");
    setProjectId("");
    setCategory("project-files");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onConfirm({
      clientId,
      projectId: clientId === "misc" ? undefined : projectId || undefined,
      category
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          reset();
        }
        onOpenChange(next);
      }}
      open={open}
    >
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Which client/project does this belong to?</DialogTitle>
          </DialogHeader>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-1.5">
              <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                Client
              </Label>
              <select
                className={selectClassName}
                onChange={(event) => {
                  setClientId(event.target.value);
                  setProjectId("");
                }}
                value={clientId}
              >
                <option value="misc">Misc</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>

            {clientId !== "misc" ? (
              <label className="grid gap-1.5">
                <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                  Project (optional)
                </Label>
                <select
                  className={selectClassName}
                  onChange={(event) => setProjectId(event.target.value)}
                  value={projectId}
                >
                  <option value="">None</option>
                  {projectsForClient.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {clientId !== "misc" && projectId ? (
              <label className="grid gap-1.5">
                <Label className="text-sm font-semibold text-[#3a3f57] dark:text-[#b4b8cc]">
                  Type
                </Label>
                <select
                  className={selectClassName}
                  onChange={(event) =>
                    setCategory(event.target.value as UploadCategory)
                  }
                  value={category}
                >
                  {CATEGORIES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          <DialogFooter className="mt-5">
            <Button
              className="h-9 rounded-lg border-black/10 px-4 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="h-9 rounded-lg bg-[#654cff] px-4 text-sm font-bold text-white hover:bg-[#5a41ea]"
              type="submit"
            >
              Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
