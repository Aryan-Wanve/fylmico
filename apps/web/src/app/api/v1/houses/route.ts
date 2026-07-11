import type { NextRequest } from "next/server";
import { CreateHouseDto } from "@/server/organizations/dto/create-house.dto";
import { organizationsService } from "@/server/organizations/organizations.service";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withRoute } from "@/server/http";

export const POST = withRoute(async (request: NextRequest) => {
  const user = requireUser(request);
  const dto = await validateDto(CreateHouseDto, await readJsonBody(request));
  return organizationsService.createHouse(user.id, dto);
});
