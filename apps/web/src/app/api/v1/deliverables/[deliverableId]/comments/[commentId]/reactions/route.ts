import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { commentsService } from "@/server/comments/comments.service";
import { ToggleCommentReactionDto } from "@/server/comments/dto/toggle-comment-reaction.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{
  deliverableId: string;
  commentId: string;
}>(async (request: NextRequest, { deliverableId, commentId }) => {
  const user = requireUser(request);
  const dto = await validateDto(
    ToggleCommentReactionDto,
    await readJsonBody(request)
  );
  return commentsService.toggleCommentReaction(
    user.id,
    deliverableId,
    commentId,
    dto.emoji
  );
});
