import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { SignupDto } from "@/server/auth/dto/signup.dto";
import { readJsonBody, validateDto, withRoute } from "@/server/http";
import { getClientIp, rateLimit } from "@/server/rate-limit";

export const POST = withRoute(async (request: NextRequest) => {
  const dto = await validateDto(SignupDto, await readJsonBody(request));
  rateLimit(`signup:${getClientIp(request)}`, 5, 60 * 60_000);
  return authService.signup(dto.email, dto.password, dto.name);
});
