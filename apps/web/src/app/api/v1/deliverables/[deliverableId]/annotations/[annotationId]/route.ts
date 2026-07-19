import type { NextRequest } from "next/server";
import { annotationsService } from "@/server/annotations/annotations.service";
import { requireUser } from "@/server/auth/require-user";
import { withParamsRoute } from "@/server/http";

export const DELETE = withParamsRoute<{
  deliverableId: string;
  annotationId: string;
}>(async (request: NextRequest, { annotationId }) => {
  const user = requireUser(request);
  await annotationsService.delete(user.id, annotationId);
  return { success: true };
});
