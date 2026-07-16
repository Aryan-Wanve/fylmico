import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";
import { shootsService } from "@/server/shoots/shoots.service";

export const POST = withParamsRoute<{ shootId: string }>(
  async (request: NextRequest, { shootId }) => {
    const user = requireUser(request);
    return shootsService.finish(user.id, shootId);
  }
);
