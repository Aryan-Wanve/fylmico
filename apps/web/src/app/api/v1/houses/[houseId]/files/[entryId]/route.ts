import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { filesService } from "@/server/files/files.service";
import { withParamsRoute } from "@/server/http";

export const DELETE = withParamsRoute<{ houseId: string; entryId: string }>(
  async (request: NextRequest, { houseId, entryId }) => {
    const user = requireUser(request);
    await filesService.deleteEntry(user.id, houseId, entryId);
    return { success: true };
  }
);
