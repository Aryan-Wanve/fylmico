import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { LoginDto } from "@/server/auth/dto/login.dto";
import { readJsonBody, validateDto, withRoute } from "@/server/http";

export const POST = withRoute(async (request: NextRequest) => {
  const dto = await validateDto(LoginDto, await readJsonBody(request));
  return authService.login(dto.email, dto.password);
});
