import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { clientsService } from "@/server/clients/clients.service";
import { withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ clientId: string }>(
  async (request: NextRequest, { clientId }) => {
    const user = requireUser(request);
    return clientsService.archive(user.id, clientId);
  }
);
