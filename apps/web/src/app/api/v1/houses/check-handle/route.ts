import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { withRoute } from "@/server/http";
import { organizationsService } from "@/server/organizations/organizations.service";

export const GET = withRoute(async (request: NextRequest) => {
  requireUser(request);
  const handle = request.nextUrl.searchParams.get("handle") ?? "";
  const available = await organizationsService.checkHandleAvailability(handle);
  return { available };
});
