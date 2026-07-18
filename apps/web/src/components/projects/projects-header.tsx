import { Building2, FolderKanban, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function ProjectsHeader({
  onNewProject,
  onNewClient
}: {
  onNewProject: () => void;
  onNewClient: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-black text-[#11142c] sm:text-3xl dark:text-[#f1f2f8]">
          Projects & Clients
        </h1>
        <p className="mt-1 text-sm text-[#5f667d] sm:text-base dark:text-[#a8acbf]">
          Every production and every company you produce work for, side by side.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="flex h-10 items-center gap-2 rounded-xl bg-[#654cff] px-4 text-sm font-bold text-white hover:bg-[#5a41ea]"
                type="button"
              >
                <Plus className="h-4 w-4" />
                New
              </button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onNewProject}>
              <FolderKanban className="h-4 w-4" />
              Project
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onNewClient}>
              <Building2 className="h-4 w-4" />
              Client
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
