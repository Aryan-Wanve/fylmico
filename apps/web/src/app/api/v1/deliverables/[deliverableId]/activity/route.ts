import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { deliverablesService } from "@/server/deliverables/deliverables.service";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ deliverableId: string }>(
  async (request: NextRequest, { deliverableId }) => {
    const user = requireUser(request);
    return deliverablesService.getActivity(user.id, deliverableId);
  }
);
