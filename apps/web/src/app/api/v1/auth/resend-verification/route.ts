import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { ResendVerificationDto } from "@/server/auth/dto/resend-verification.dto";
import { readJsonBody, validateDto, withRoute } from "@/server/http";

export const POST = withRoute(async (request: NextRequest) => {
  const dto = await validateDto(
    ResendVerificationDto,
    await readJsonBody(request)
  );
  await authService.resendVerificationEmail(dto.email);
  return { success: true };
});
