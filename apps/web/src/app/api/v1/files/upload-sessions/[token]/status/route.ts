import type { NextRequest } from "next/server";
import { filesService } from "@/server/files/files.service";
import { withParamsRoute } from "@/server/http";

// Unauthenticated by design - see chunk/route.ts.
export const GET = withParamsRoute<{ token: string }>(
  async (_request: NextRequest, { token }) => {
    return filesService.getUploadStatus(token);
  }
);
