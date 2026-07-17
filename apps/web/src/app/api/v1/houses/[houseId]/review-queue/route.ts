import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import {
  deliverablesService,
  type ReviewQueueFilters
} from "@/server/deliverables/deliverables.service";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const params = request.nextUrl.searchParams;
    const filters: ReviewQueueFilters = {
      projectId: params.get("projectId") ?? undefined,
      clientId: params.get("clientId") ?? undefined,
      editorId: params.get("editorId") ?? undefined,
      status: params.get("status") ?? undefined,
      priority: params.get("priority") ?? undefined,
      search: params.get("search") ?? undefined,
      sortBy:
        (params.get("sortBy") as ReviewQueueFilters["sortBy"]) ?? undefined
    };
    return deliverablesService.listQueue(user.id, houseId, filters);
  }
);
