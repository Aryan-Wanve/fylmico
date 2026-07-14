import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { VerifyEmailDto } from "@/server/auth/dto/verify-email.dto";
import { extractRequestMeta } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withRoute } from "@/server/http";

export const POST = withRoute(async (request: NextRequest) => {
  const dto = await validateDto(VerifyEmailDto, await readJsonBody(request));
  return authService.verifyEmail(
    dto.email,
    dto.code,
    extractRequestMeta(request)
  );
});
