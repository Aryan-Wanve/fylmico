import type { NextRequest } from "next/server";
import { RequestReviewChangesDto } from "@/server/review-sessions/dto/request-review-changes.dto";
import { reviewClientActionsService } from "@/server/review-sessions/review-client-actions.service";
import { reviewSessionCookieName } from "@/server/review-sessions/review-session-cookie";
import { reviewSessionsService } from "@/server/review-sessions/review-sessions.service";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ token: string }>(
  async (request: NextRequest, { token }) => {
    const session = await reviewSessionsService.findValidSession(token);
    const cookieValue = request.cookies.get(
      reviewSessionCookieName(session.id)
    )?.value;
    const dto = await validateDto(
      RequestReviewChangesDto,
      await readJsonBody(request)
    );

    // priority/deadline aren't separate columns on the deliverable's
    // request-revision flow - fold them into the feedback text rather than
    // widening deliverablesService's revision API for two optional extras.
    const feedback = [
      dto.feedback.trim(),
      dto.priority ? `Priority: ${dto.priority}` : null,
      dto.deadline ? `Requested deadline: ${dto.deadline}` : null
    ]
      .filter(Boolean)
      .join("\n");

    await reviewClientActionsService.requestChanges(
      token,
      cookieValue,
      feedback
    );
    return { submitted: true };
  }
);
