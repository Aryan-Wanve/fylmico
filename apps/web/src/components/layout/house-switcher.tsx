"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Check, ChevronDown, LayoutGrid } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getLastPage } from "@/lib/house-last-page";
import { useWorkspace } from "@/lib/workspace-context";
import { activateHouse } from "@/services/base-workspace.service";

export function HouseSwitcher() {
  const router = useRouter();
  const { workspace, activeHouse, refreshWorkspace } = useWorkspace();
  const [switching, setSwitching] = useState(false);

  if (!activeHouse) {
    return null;
  }

  // Only real, joined, non-archived houses are switch targets here; the
  // full grid (create / join / archived / pending) lives in the House Center.
  const houses = workspace.houses.filter(
    (house) => !house.isArchived && house.myRole !== null
  );

  async function handleSwitch(houseId: string) {
    if (houseId === activeHouse?.id || switching) {
      return;
    }
    setSwitching(true);
    try {
      await activateHouse(houseId);
      await refreshWorkspace();
      router.push((getLastPage(houseId) ?? "/home") as Route);
    } finally {
      setSwitching(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            aria-label="Switch house"
            className="flex max-w-[12rem] items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[#12142b] hover:bg-black/[0.04] sm:max-w-[16rem] dark:text-[#f1f2f8] dark:hover:bg-white/[0.06]"
            type="button"
          >
            <span className="truncate text-sm font-bold sm:text-base">
              {activeHouse.name}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[#667085] dark:text-[#878ca0]" />
          </button>
        }
      />
      <DropdownMenuContent align="center" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Your houses</DropdownMenuLabel>
          {houses.map((house) => {
            const active = house.id === activeHouse.id;
            return (
              <DropdownMenuItem
                disabled={switching}
                key={house.id}
                onClick={() => void handleSwitch(house.id)}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[var(--fylmico-accent)]/10 text-[11px] font-black text-[var(--fylmico-accent)]">
                  {house.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate">{house.name}</span>
                {active ? (
                  <Check className="h-4 w-4 shrink-0 text-[var(--fylmico-accent)]" />
                ) : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<a href="/dashboard" />}>
          <LayoutGrid className="h-4 w-4" />
          Open House Center
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
