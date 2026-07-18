import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import {
  AppException,
  HttpStatus,
  readJsonBody,
  validateDto,
  withParamsRoute
} from "@/server/http";
import { CreateShootDto } from "@/server/shoots/dto/create-shoot.dto";
import { shootsService } from "@/server/shoots/shoots.service";

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(CreateShootDto, await readJsonBody(request));
    if (!dto.ownerType || !dto.ownerId) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "ownerType and ownerId are required."
      );
    }
    return shootsService.create(
      user.id,
      houseId,
      { ownerType: dto.ownerType, ownerId: dto.ownerId },
      dto
    );
  }
);
