import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { commentsService } from "@/server/comments/comments.service";
import { withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{
  deliverableId: string;
  commentId: string;
}>(async (request: NextRequest, { deliverableId, commentId }) => {
  const user = requireUser(request);
  return commentsService.reopenComment(user.id, deliverableId, commentId);
});
