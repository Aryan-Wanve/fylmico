import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { clientsService } from "@/server/clients/clients.service";
import { CreateClientDto } from "@/server/clients/dto/create-client.dto";
import {
  queryToObject,
  readJsonBody,
  validateDto,
  withPaginatedParamsRoute,
  withParamsRoute
} from "@/server/http";
import { CursorPaginationDto } from "@/server/pagination";

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(CreateClientDto, await readJsonBody(request));
    return clientsService.create(user.id, houseId, dto);
  }
);

export const GET = withPaginatedParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const pagination = await validateDto(
      CursorPaginationDto,
      queryToObject(request)
    );
    return clientsService.list(user.id, houseId, pagination);
  }
);
