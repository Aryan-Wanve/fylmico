import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { queryToObject, validateDto, withPaginatedRoute } from "@/server/http";
import { notificationsService } from "@/server/notifications/notifications.service";
import { CursorPaginationDto } from "@/server/pagination";

export const GET = withPaginatedRoute(async (request: NextRequest) => {
  const user = requireUser(request);
  const pagination = await validateDto(
    CursorPaginationDto,
    queryToObject(request)
  );
  return notificationsService.list(user.id, pagination);
});
