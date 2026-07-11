import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { ChangePasswordDto } from "@/server/auth/dto/change-password.dto";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withRoute } from "@/server/http";

export const POST = withRoute(async (request: NextRequest) => {
  const user = requireUser(request);
  const dto = await validateDto(ChangePasswordDto, await readJsonBody(request));
  await authService.changePassword(
    user.id,
    user.sessionId,
    dto.currentPassword,
    dto.newPassword
  );
  return { success: true };
});
