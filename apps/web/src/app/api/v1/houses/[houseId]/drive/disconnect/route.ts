import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { driveService } from "@/server/drive/drive.service";
import { withParamsRoute } from "@/server/http";

export const DELETE = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    await driveService.disconnect(houseId, user.id);
    return { success: true };
  }
);
