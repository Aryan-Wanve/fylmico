import type { NextRequest } from "next/server";
import { organizationsService } from "@/server/organizations/organizations.service";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ token: string }>(
  async (_request: NextRequest, { token }) => {
    return organizationsService.getInvitationPreview(token);
  }
);
