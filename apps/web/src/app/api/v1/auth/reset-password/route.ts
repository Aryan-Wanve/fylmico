import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { ResetPasswordDto } from "@/server/auth/dto/reset-password.dto";
import { readJsonBody, validateDto, withRoute } from "@/server/http";

export const POST = withRoute(async (request: NextRequest) => {
  const dto = await validateDto(ResetPasswordDto, await readJsonBody(request));
  await authService.resetPassword(dto.token, dto.newPassword);
  return { success: true };
});
