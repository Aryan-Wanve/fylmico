import type { NextRequest } from "next/server";
import { announcementsService } from "@/server/announcements/announcements.service";
import { CreateAnnouncementDto } from "@/server/announcements/dto/create-announcement.dto";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    return announcementsService.list(user.id, houseId);
  }
);

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      CreateAnnouncementDto,
      await readJsonBody(request)
    );
    return announcementsService.create(user.id, houseId, dto);
  }
);
