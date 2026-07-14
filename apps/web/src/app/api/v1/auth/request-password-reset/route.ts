import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { RequestPasswordResetDto } from "@/server/auth/dto/request-password-reset.dto";
import { readJsonBody, validateDto, withRoute } from "@/server/http";
import { getClientIp, rateLimit } from "@/server/rate-limit";

export const POST = withRoute(async (request: NextRequest) => {
  const dto = await validateDto(
    RequestPasswordResetDto,
    await readJsonBody(request)
  );
  rateLimit(
    `request-password-reset:${getClientIp(request)}:${dto.email.toLowerCase()}`,
    5,
    15 * 60_000
  );
  await authService.requestPasswordReset(dto.email);
  return { success: true };
});
