import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { commentsService } from "@/server/comments/comments.service";
import { withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{
  deliverableId: string;
  commentId: string;
}>(async (request: NextRequest, { commentId }) => {
  const user = requireUser(request);
  return commentsService.resolveComment(user.id, commentId);
});
