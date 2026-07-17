import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { deliverablesService } from "@/server/deliverables/deliverables.service";
import { readJsonBody, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ deliverableId: string }>(
  async (request: NextRequest, { deliverableId }) => {
    const user = requireUser(request);
    const body = await readJsonBody(request);
    const comment =
      typeof (body as { comment?: unknown }).comment === "string"
        ? (body as { comment: string }).comment
        : undefined;
    return deliverablesService.requestRevision(user.id, deliverableId, comment);
  }
);
