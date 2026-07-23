import type { NextRequest } from "next/server";
import { ToggleReviewReactionDto } from "@/server/review-sessions/dto/toggle-review-reaction.dto";
import { reviewClientActionsService } from "@/server/review-sessions/review-client-actions.service";
import { reviewSessionCookieName } from "@/server/review-sessions/review-session-cookie";
import { reviewSessionsService } from "@/server/review-sessions/review-sessions.service";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ token: string; commentId: string }>(
  async (request: NextRequest, { token, commentId }) => {
    const session = await reviewSessionsService.findValidSession(token);
    const cookieValue = request.cookies.get(
      reviewSessionCookieName(session.id)
    )?.value;
    const dto = await validateDto(
      ToggleReviewReactionDto,
      await readJsonBody(request)
    );
    return reviewClientActionsService.toggleReaction(
      token,
      cookieValue,
      commentId,
      dto.emoji
    );
  }
);
