import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { filesService } from "@/server/files/files.service";
import { AppException, HttpStatus, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const formData = await request.formData();

    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "A file is required."
      );
    }

    const parentId = formData.get("parentId");
    const conversationId = formData.get("conversationId");
    const taskId = formData.get("taskId");

    return filesService.uploadFile(
      user.id,
      houseId,
      typeof parentId === "string" && parentId ? parentId : null,
      {
        name: file.name,
        buffer: await file.arrayBuffer(),
        mimeType: file.type || "application/octet-stream",
        size: file.size
      },
      typeof conversationId === "string" && conversationId
        ? conversationId
        : null,
      typeof taskId === "string" && taskId ? taskId : null
    );
  }
);
