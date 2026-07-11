import type { NextRequest } from "next/server";
import { organizationsService } from "@/server/organizations/organizations.service";
import { requireUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";

export const DELETE = withParamsRoute<{
  houseId: string;
  invitationId: string;
}>(async (request: NextRequest, { houseId, invitationId }) => {
  const user = requireUser(request);
  await organizationsService.revokeInvitation(houseId, user.id, invitationId);
  return { success: true };
});
