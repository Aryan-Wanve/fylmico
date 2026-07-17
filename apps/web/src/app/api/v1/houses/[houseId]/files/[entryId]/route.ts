import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { UpdateMediaMetadataDto } from "@/server/files/dto/update-media-metadata.dto";
import { filesService } from "@/server/files/files.service";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const DELETE = withParamsRoute<{ houseId: string; entryId: string }>(
  async (request: NextRequest, { houseId, entryId }) => {
    const user = requireUser(request);
    await filesService.deleteEntry(user.id, houseId, entryId);
    return { success: true };
  }
);

export const PATCH = withParamsRoute<{ houseId: string; entryId: string }>(
  async (request: NextRequest, { houseId, entryId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      UpdateMediaMetadataDto,
      await readJsonBody(request)
    );
    return filesService.updateMediaMetadata(user.id, houseId, entryId, dto);
  }
);
