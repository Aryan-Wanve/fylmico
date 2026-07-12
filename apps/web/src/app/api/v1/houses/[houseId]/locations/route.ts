import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { CreateLocationDto } from "@/server/storyboard/dto/create-location.dto";
import { storyboardService } from "@/server/storyboard/storyboard.service";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    return storyboardService.listLocations(user.id, houseId);
  }
);

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      CreateLocationDto,
      await readJsonBody(request)
    );
    return storyboardService.createLocation(user.id, houseId, dto);
  }
);
