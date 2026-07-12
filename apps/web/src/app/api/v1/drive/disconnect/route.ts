import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { driveService } from "@/server/drive/drive.service";
import { withRoute } from "@/server/http";

export const DELETE = withRoute(async (request: NextRequest) => {
  const user = requireUser(request);
  await driveService.disconnect(user.id);
  return { success: true };
});
