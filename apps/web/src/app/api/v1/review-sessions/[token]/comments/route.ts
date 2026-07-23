import type { NextRequest } from "next/server";
import { AddReviewCommentDto } from "@/server/review-sessions/dto/add-review-comment.dto";
import { reviewClientActionsService } from "@/server/review-sessions/review-client-actions.service";
import { reviewSessionCookieName } from "@/server/review-sessions/review-session-cookie";
import { reviewSessionsService } from "@/server/review-sessions/review-sessions.service";
import {
  HttpStatus,
  readJsonBody,
  validateDto,
  withParamsRoute
} from "@/server/http";

export const POST = withParamsRoute<{ token: string }>(
  async (request: NextRequest, { token }) => {
    const session = await reviewSessionsService.findValidSession(token);
    const cookieValue = request.cookies.get(
      reviewSessionCookieName(session.id)
    )?.value;
    const dto = await validateDto(
      AddReviewCommentDto,
      await readJsonBody(request)
    );
    return reviewClientActionsService.addComment(token, cookieValue, dto);
  },
  HttpStatus.CREATED
);
