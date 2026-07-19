import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { commentsService } from "@/server/comments/comments.service";
import { UpdateCommentDto } from "@/server/comments/dto/update-comment.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const PATCH = withParamsRoute<{
  deliverableId: string;
  commentId: string;
}>(async (request: NextRequest, { deliverableId, commentId }) => {
  const user = requireUser(request);
  const dto = await validateDto(UpdateCommentDto, await readJsonBody(request));
  return commentsService.updateComment(
    user.id,
    deliverableId,
    commentId,
    dto.body
  );
});

export const DELETE = withParamsRoute<{
  deliverableId: string;
  commentId: string;
}>(async (request: NextRequest, { deliverableId, commentId }) => {
  const user = requireUser(request);
  await commentsService.deleteComment(user.id, deliverableId, commentId);
  return { success: true };
});
