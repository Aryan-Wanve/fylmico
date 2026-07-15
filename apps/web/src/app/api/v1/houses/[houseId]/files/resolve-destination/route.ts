import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { filesService } from "@/server/files/files.service";
import { ResolveDestinationDto } from "@/server/files/dto/resolve-destination.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      ResolveDestinationDto,
      await readJsonBody(request)
    );
    return filesService.resolveDestination(user.id, houseId, dto);
  }
);
