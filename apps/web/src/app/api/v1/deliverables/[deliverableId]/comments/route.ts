import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { commentsService } from "@/server/comments/comments.service";
import { CreateCommentDto } from "@/server/comments/dto/create-comment.dto";
import {
  queryToObject,
  readJsonBody,
  validateDto,
  withPaginatedParamsRoute,
  withParamsRoute
} from "@/server/http";
import { CursorPaginationDto } from "@/server/pagination";

export const POST = withParamsRoute<{ deliverableId: string }>(
  async (request: NextRequest, { deliverableId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      CreateCommentDto,
      await readJsonBody(request)
    );
    return commentsService.createForDeliverable(
      user.id,
      deliverableId,
      dto.body,
      dto.timestampSeconds
    );
  }
);

export const GET = withPaginatedParamsRoute<{ deliverableId: string }>(
  async (request: NextRequest, { deliverableId }) => {
    const user = requireUser(request);
    const pagination = await validateDto(
      CursorPaginationDto,
      queryToObject(request)
    );
    return commentsService.listForDeliverable(
      user.id,
      deliverableId,
      pagination
    );
  }
);
