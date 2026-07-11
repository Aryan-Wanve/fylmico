import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { filesService } from "@/server/files/files.service";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string; entryId: string }>(
  async (request: NextRequest, { houseId, entryId }) => {
    const user = requireUser(request);
    const url = await filesService.getDownloadUrl(user.id, houseId, entryId);
    return { url };
  }
);
