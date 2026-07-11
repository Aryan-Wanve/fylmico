import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { requireUser } from "@/server/auth/require-user";
import { AppException, HttpStatus, withRoute } from "@/server/http";

export const POST = withRoute(async (request: NextRequest) => {
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

  return authService.updateAvatar(user.id, {
    name: file.name,
    buffer: await file.arrayBuffer(),
    mimeType: file.type || "application/octet-stream"
  });
});
