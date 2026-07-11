import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { RequestPasswordResetDto } from "@/server/auth/dto/request-password-reset.dto";
import { readJsonBody, validateDto, withRoute } from "@/server/http";

export const POST = withRoute(async (request: NextRequest) => {
  const dto = await validateDto(
    RequestPasswordResetDto,
    await readJsonBody(request)
  );
  await authService.requestPasswordReset(dto.email);
  return { success: true };
});
