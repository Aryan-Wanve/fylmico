import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { SignupDto } from "@/server/auth/dto/signup.dto";
import { readJsonBody, validateDto, withRoute } from "@/server/http";

export const POST = withRoute(async (request: NextRequest) => {
  const dto = await validateDto(SignupDto, await readJsonBody(request));
  return authService.signup(dto.email, dto.password, dto.name);
});
