import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";
import { ReportShootIssueDto } from "@/server/shoots/dto/report-shoot-issue.dto";
import { shootsService } from "@/server/shoots/shoots.service";

export const POST = withParamsRoute<{ shootId: string }>(
  async (request: NextRequest, { shootId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      ReportShootIssueDto,
      await readJsonBody(request)
    );
    await shootsService.reportIssue(user.id, shootId, dto);
    return { success: true };
  }
);
