import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { driveService } from "@/server/drive/drive.service";
import { withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    requireUser(request);
    return driveService.getStatus(houseId);
  }
);
