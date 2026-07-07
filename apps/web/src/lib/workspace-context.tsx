"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode
} from "react";
import { getWorkspace } from "@/services/base-workspace.service";
import type { House, WorkspaceSnapshot } from "@/types/base";

type WorkspaceContextValue = {
  workspace: WorkspaceSnapshot;
  activeHouse: House | undefined;
  refreshWorkspace: () => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  children,
  initialWorkspace
}: {
  children: ReactNode;
  initialWorkspace: WorkspaceSnapshot;
}) {
  const [workspace, setWorkspace] = useState(initialWorkspace);

  const refreshWorkspace = useCallback(async () => {
    const snapshot = await getWorkspace();
    setWorkspace(snapshot);
  }, []);

  const activeHouse = workspace.houses.find(
    (house) => house.id === workspace.activeHouseId
  );

  return (
    <WorkspaceContext.Provider
      value={{ workspace, activeHouse, refreshWorkspace }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }

  return context;
}
