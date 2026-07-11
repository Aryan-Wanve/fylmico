import type { NextRequest } from "next/server";
import { organizationsService } from "@/server/organizations/organizations.service";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ code: string }>(
  async (_request: NextRequest, { code }) => {
    return organizationsService.getInviteCodePreview(code);
  }
);
