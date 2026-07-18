import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { deliverablesService } from "@/server/deliverables/deliverables.service";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ clientId: string }>(
  async (request: NextRequest, { clientId }) => {
    const user = requireUser(request);
    return deliverablesService.listForClient(user.id, clientId);
  }
);
