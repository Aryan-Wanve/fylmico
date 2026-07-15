import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";
import { AssignRoleDto } from "@/server/organizations/dto/assign-role.dto";
import { organizationsService } from "@/server/organizations/organizations.service";

export const POST = withParamsRoute<{
  houseId: string;
  membershipId: string;
}>(async (request: NextRequest, { houseId, membershipId }) => {
  const user = requireUser(request);
  const dto = await validateDto(AssignRoleDto, await readJsonBody(request));
  return organizationsService.assignRole(houseId, user.id, membershipId, dto);
});
