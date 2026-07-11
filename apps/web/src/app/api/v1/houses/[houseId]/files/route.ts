import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { CreateFolderDto } from "@/server/files/dto/create-folder.dto";
import { filesService } from "@/server/files/files.service";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const parentId = request.nextUrl.searchParams.get("parentId");
    return filesService.list(user.id, houseId, parentId);
  }
);

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(CreateFolderDto, await readJsonBody(request));
    return filesService.createFolder(user.id, houseId, dto);
  }
);
