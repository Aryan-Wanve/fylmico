import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { requireUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";

export const DELETE = withParamsRoute<{ sessionId: string }>(
  async (request: NextRequest, { sessionId }) => {
    const user = requireUser(request);
    await authService.revokeSession(user.id, sessionId);
    return { success: true };
  }
);
