"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { listTaskTemplates } from "@/services/base-workspace.service";
import type { ProductionTask } from "@/types/base";

export function TaskTemplatesPopover({
  houseId,
  onUseTemplate
}: {
  houseId: string;
  onUseTemplate: (templateId: string) => void;
}) {
  const [templates, setTemplates] = useState<ProductionTask[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleOpen(open: boolean) {
    if (!open) {
      return;
    }
    setLoading(true);
    try {
      setTemplates(await listTaskTemplates(houseId));
    } catch {
      // Templates just show empty on failure.
    } finally {
      setLoading(false);
    }
  }

  return (
    <Popover onOpenChange={handleOpen}>
      <PopoverTrigger
        render={
          <button
            className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:bg-[#171a28] dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
            type="button"
          >
            <Sparkles className="h-4 w-4" />
            Templates
          </button>
        }
      />
      <PopoverContent align="start" className="grid w-64 gap-1">
        <strong className="px-1 text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          Task Templates
        </strong>
        {loading ? (
          <p className="px-1 py-4 text-center text-sm text-[#667085] dark:text-[#7d8299]">
            Loading...
          </p>
        ) : templates.length === 0 ? (
          <p className="px-1 py-4 text-center text-sm text-[#667085] dark:text-[#7d8299]">
            No templates yet. Save a task as a template from its menu.
          </p>
        ) : (
          templates.map((template) => (
            <button
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
              key={template.id}
              onClick={() => onUseTemplate(template.id)}
              type="button"
            >
              <span className="truncate text-[#3a3f57] dark:text-[#b4b8cc]">
                {template.title}
              </span>
              <span className="shrink-0 text-xs font-bold text-[var(--fylmico-accent)]">
                Use
              </span>
            </button>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}
