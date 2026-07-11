import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";
import { CreateTimeEntryDto } from "@/server/time-entries/dto/create-time-entry.dto";
import { timeEntriesService } from "@/server/time-entries/time-entries.service";

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    return timeEntriesService.list(user.id, houseId);
  }
);

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      CreateTimeEntryDto,
      await readJsonBody(request)
    );
    return timeEntriesService.create(user.id, houseId, dto);
  }
);
