import type { NextRequest } from "next/server";
import { organizationsService } from "@/server/organizations/organizations.service";
import { requireUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ token: string }>(
  async (request: NextRequest, { token }) => {
    const user = requireUser(request);
    return organizationsService.acceptInvitation(user.id, token);
  }
);
