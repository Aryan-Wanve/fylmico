import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { CursorPaginationDto } from "@/server/pagination";
import {
  queryToObject,
  readJsonBody,
  validateDto,
  withPaginatedParamsRoute,
  withParamsRoute
} from "@/server/http";
import { CreateProjectDto } from "@/server/projects/dto/create-project.dto";
import { projectsService } from "@/server/projects/projects.service";

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      CreateProjectDto,
      await readJsonBody(request)
    );
    return projectsService.create(user.id, houseId, dto);
  }
);

export const GET = withPaginatedParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const pagination = await validateDto(
      CursorPaginationDto,
      queryToObject(request)
    );
    return projectsService.list(user.id, houseId, pagination);
  }
);
