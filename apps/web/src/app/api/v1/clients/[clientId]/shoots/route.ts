import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { shootsService } from "@/server/shoots/shoots.service";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ clientId: string }>(
  async (request: NextRequest, { clientId }) => {
    const user = requireUser(request);
    return shootsService.listForClient(user.id, clientId);
  }
);
