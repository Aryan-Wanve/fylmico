import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { InitiateUploadDto } from "@/server/files/dto/initiate-upload.dto";
import { filesService } from "@/server/files/files.service";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      InitiateUploadDto,
      await readJsonBody(request)
    );
    return filesService.initiateUpload(user.id, houseId, dto);
  }
);
