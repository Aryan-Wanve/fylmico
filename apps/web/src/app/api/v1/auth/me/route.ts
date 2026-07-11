import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { UpdateMeDto } from "@/server/auth/dto/update-me.dto";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withRoute } from "@/server/http";

export const GET = withRoute(async (request: NextRequest) => {
  const user = requireUser(request);
  return authService.me(user.id);
});

export const PATCH = withRoute(async (request: NextRequest) => {
  const user = requireUser(request);
  const dto = await validateDto(UpdateMeDto, await readJsonBody(request));
  return authService.updateMe(user.id, dto);
});
