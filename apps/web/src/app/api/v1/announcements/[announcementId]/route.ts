import type { NextRequest } from "next/server";
import { announcementsService } from "@/server/announcements/announcements.service";
import { UpdateAnnouncementDto } from "@/server/announcements/dto/update-announcement.dto";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const PATCH = withParamsRoute<{ announcementId: string }>(
  async (request: NextRequest, { announcementId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      UpdateAnnouncementDto,
      await readJsonBody(request)
    );
    return announcementsService.update(user.id, announcementId, dto);
  }
);

export const DELETE = withParamsRoute<{ announcementId: string }>(
  async (request: NextRequest, { announcementId }) => {
    const user = requireUser(request);
    await announcementsService.remove(user.id, announcementId);
    return { success: true };
  }
);
