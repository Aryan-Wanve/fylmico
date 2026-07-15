import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, withRoute } from "@/server/http";
import { organizationsService } from "@/server/organizations/organizations.service";

export const POST = withRoute(async (request: NextRequest) => {
  const user = requireUser(request);
  const body = (await readJsonBody(request)) as { organizationIds: string[] };
  await organizationsService.reorderHouses(user.id, body.organizationIds);
  return { success: true };
});
