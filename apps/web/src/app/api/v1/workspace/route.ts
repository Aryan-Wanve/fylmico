import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { withRoute } from "@/server/http";
import { workspaceService } from "@/server/workspace/workspace.service";

export const GET = withRoute(async (request: NextRequest) => {
  const user = requireUser(request);
  return workspaceService.getWorkspace(user.id);
});
