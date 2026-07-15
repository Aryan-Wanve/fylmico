import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";
import { organizationsService } from "@/server/organizations/organizations.service";

export const POST = withParamsRoute<{
  houseId: string;
  membershipId: string;
}>(async (request: NextRequest, { houseId, membershipId }) => {
  const user = requireUser(request);
  return organizationsService.banPendingMember(houseId, user.id, membershipId);
});
