import type { NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { UpdateNotificationPreferencesDto } from "@/server/auth/dto/update-notification-preferences.dto";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withRoute } from "@/server/http";

export const PATCH = withRoute(async (request: NextRequest) => {
  const user = requireUser(request);
  const dto = await validateDto(
    UpdateNotificationPreferencesDto,
    await readJsonBody(request)
  );
  return authService.updateNotificationPreferences(user.id, dto.preferences);
});
