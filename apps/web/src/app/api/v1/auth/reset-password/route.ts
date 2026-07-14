import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { ResetPasswordDto } from "@/server/auth/dto/reset-password.dto";
import { readJsonBody, validateDto, withRoute } from "@/server/http";
import { getClientIp, rateLimit } from "@/server/rate-limit";

export const POST = withRoute(async (request: NextRequest) => {
  const dto = await validateDto(ResetPasswordDto, await readJsonBody(request));
  rateLimit(
    `reset-password:${getClientIp(request)}:${dto.email.toLowerCase()}`,
    10,
    15 * 60_000
  );
  await authService.resetPassword(dto.email, dto.code, dto.newPassword);
  return { success: true };
});
