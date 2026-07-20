"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { formatFileSize } from "@/components/files/file-data";
import { getClientStats } from "@/services/base-workspace.service";
import type { ClientItem, ClientStats } from "@/types/base";

export function ClientCard({
  client,
  onEdit,
  onArchive,
  onDelete
}: {
  client: ClientItem;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [stats, setStats] = useState<ClientStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    getClientStats(client.id)
      .then((data) => {
        if (!cancelled) {
          setStats(data);
        }
      })
      .catch(() => {
        // Stats fail quietly - the rest of the card still renders.
      });

    return () => {
      cancelled = true;
    };
  }, [client.id]);

  return (
    <article
      className="grid min-w-0 cursor-pointer gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]"
      onClick={() => router.push(`/projects/clients/${client.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          {client.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- client logos are arbitrary external URLs, not local/optimizable assets
            <img
              alt=""
              className="h-10 w-10 shrink-0 rounded-xl object-cover"
              src={client.logoUrl}
            />
          ) : (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--fylmico-accent)]/10 text-sm font-bold text-[var(--fylmico-accent)]">
              {client.name.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <strong className="block truncate text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
              {client.name}
            </strong>
            {client.contactName ? (
              <span className="block truncate text-xs text-[#8a90a3] dark:text-[#7d8299]">
                {client.contactName}
              </span>
            ) : null}
          </div>
        </div>
        <DropdownMenu>
          <div onClick={(event) => event.stopPropagation()}>
            <DropdownMenuTrigger
              render={
                <button
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#8a90a3] hover:bg-black/[0.04] dark:text-[#7d8299] dark:hover:bg-white/[0.06]"
                  type="button"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              }
            />
          </div>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive}>Archive</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-black/5 pt-3 text-center dark:border-white/[0.06]">
        <div>
          <strong className="block text-base font-black text-[#11142c] dark:text-[#f1f2f8]">
            {stats?.activeTasks ?? "-"}
          </strong>
          <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
            Active
          </span>
        </div>
        <div>
          <strong className="block text-base font-black text-[#11142c] dark:text-[#f1f2f8]">
            {stats?.completedTasks ?? "-"}
          </strong>
          <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
            Completed
          </span>
        </div>
        <div>
          <strong className="block text-base font-black text-[#11142c] dark:text-[#f1f2f8]">
            {stats ? formatFileSize(stats.storageBytes) : "-"}
          </strong>
          <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
            Storage
          </span>
        </div>
      </div>
    </article>
  );
}
