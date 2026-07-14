import type { NextRequest } from "next/server";
import { RequestJoinHouseDto } from "@/server/organizations/dto/request-join-house.dto";
import { organizationsService } from "@/server/organizations/organizations.service";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withRoute } from "@/server/http";

export const POST = withRoute(async (request: NextRequest) => {
  const user = requireUser(request);
  const dto = await validateDto(
    RequestJoinHouseDto,
    await readJsonBody(request)
  );
  return organizationsService.requestToJoinHouse(user.id, dto);
});
