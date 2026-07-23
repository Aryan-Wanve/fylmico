import type { NextRequest } from "next/server";
import { VerifyPasswordDto } from "@/server/review-sessions/dto/verify-password.dto";
import { reviewSessionsService } from "@/server/review-sessions/review-sessions.service";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ token: string }>(
  async (request: NextRequest, { token }) => {
    const dto = await validateDto(
      VerifyPasswordDto,
      await readJsonBody(request)
    );
    await reviewSessionsService.verifyPassword(token, dto.password);
    return { verified: true };
  }
);
