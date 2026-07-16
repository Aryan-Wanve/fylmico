import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { clientsService } from "@/server/clients/clients.service";
import { UpdateClientDto } from "@/server/clients/dto/update-client.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ clientId: string }>(
  async (request: NextRequest, { clientId }) => {
    const user = requireUser(request);
    return clientsService.get(user.id, clientId);
  }
);

export const PATCH = withParamsRoute<{ clientId: string }>(
  async (request: NextRequest, { clientId }) => {
    const user = requireUser(request);
    const dto = await validateDto(UpdateClientDto, await readJsonBody(request));
    return clientsService.update(user.id, clientId, dto);
  }
);

export const DELETE = withParamsRoute<{ clientId: string }>(
  async (request: NextRequest, { clientId }) => {
    const user = requireUser(request);
    return clientsService.delete(user.id, clientId);
  }
);
