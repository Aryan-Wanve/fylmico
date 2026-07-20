import { Building2, FolderKanban } from "lucide-react";
import type { OwnerType } from "@/types/base";

// Shows which owner a piece of work belongs to - a Project or a Client
// (ADR 0059). Used wherever tasks/deliverables/shoots are listed.
export function OwnerBadge({
  ownerType,
  ownerName,
  className = ""
}: {
  ownerType: OwnerType | null;
  ownerName: string | null;
  className?: string;
}) {
  if (!ownerType || !ownerName) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs text-[#667085] dark:text-[#7d8299] ${className}`}
      >
        No owner
      </span>
    );
  }

  const isProject = ownerType === "project";
  const Icon = isProject ? FolderKanban : Building2;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
        isProject
          ? "bg-[var(--fylmico-accent)]/10 text-[var(--fylmico-accent)]"
          : "bg-[#16c784]/10 text-[#0f9d63] dark:text-[#16c784]"
      } ${className}`}
      title={`${ownerName} · ${isProject ? "Project" : "Client"}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{ownerName}</span>
    </span>
  );
}
