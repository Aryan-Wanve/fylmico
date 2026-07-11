import type { NextRequest } from "next/server";
import { JoinHouseDto } from "@/server/organizations/dto/join-house.dto";
import { organizationsService } from "@/server/organizations/organizations.service";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withRoute } from "@/server/http";

export const POST = withRoute(async (request: NextRequest) => {
  const user = requireUser(request);
  const dto = await validateDto(JoinHouseDto, await readJsonBody(request));
  return organizationsService.joinHouse(user.id, dto);
});
