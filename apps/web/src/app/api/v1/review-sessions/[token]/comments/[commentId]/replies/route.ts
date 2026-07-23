import type { NextRequest } from "next/server";
import { AddReviewReplyDto } from "@/server/review-sessions/dto/add-review-reply.dto";
import { reviewClientActionsService } from "@/server/review-sessions/review-client-actions.service";
import { reviewSessionCookieName } from "@/server/review-sessions/review-session-cookie";
import { reviewSessionsService } from "@/server/review-sessions/review-sessions.service";
import {
  HttpStatus,
  readJsonBody,
  validateDto,
  withParamsRoute
} from "@/server/http";

export const POST = withParamsRoute<{ token: string; commentId: string }>(
  async (request: NextRequest, { token, commentId }) => {
    const session = await reviewSessionsService.findValidSession(token);
    const cookieValue = request.cookies.get(
      reviewSessionCookieName(session.id)
    )?.value;
    const dto = await validateDto(
      AddReviewReplyDto,
      await readJsonBody(request)
    );
    return reviewClientActionsService.addReply(
      token,
      cookieValue,
      commentId,
      dto.body
    );
  },
  HttpStatus.CREATED
);
