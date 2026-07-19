import type { NextRequest } from "next/server";
import { annotationsService } from "@/server/annotations/annotations.service";
import { CreateAnnotationDto } from "@/server/annotations/dto/create-annotation.dto";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ deliverableId: string }>(
  async (request: NextRequest, { deliverableId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      CreateAnnotationDto,
      await readJsonBody(request)
    );
    return annotationsService.create(user.id, deliverableId, dto);
  }
);

export const GET = withParamsRoute<{ deliverableId: string }>(
  async (request: NextRequest, { deliverableId }) => {
    const user = requireUser(request);
    return annotationsService.listForDeliverable(user.id, deliverableId);
  }
);
