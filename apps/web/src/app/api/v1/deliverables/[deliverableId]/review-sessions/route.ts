import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { SendClientReviewDto } from "@/server/review-sessions/dto/send-client-review.dto";
import { reviewSessionsService } from "@/server/review-sessions/review-sessions.service";
import {
  HttpStatus,
  readJsonBody,
  validateDto,
  withParamsRoute
} from "@/server/http";

export const POST = withParamsRoute<{ deliverableId: string }>(
  async (request: NextRequest, { deliverableId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      SendClientReviewDto,
      await readJsonBody(request)
    );
    return reviewSessionsService.createAndSend(user.id, deliverableId, dto);
  },
  HttpStatus.CREATED
);

export const GET = withParamsRoute<{ deliverableId: string }>(
  async (request: NextRequest, { deliverableId }) => {
    const user = requireUser(request);
    return reviewSessionsService.listForDeliverable(user.id, deliverableId);
  }
);
