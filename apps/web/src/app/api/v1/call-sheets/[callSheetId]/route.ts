import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { callSheetsService } from "@/server/call-sheets/call-sheets.service";
import { UpdateCallSheetDto } from "@/server/call-sheets/dto/update-call-sheet.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ callSheetId: string }>(
  async (request: NextRequest, { callSheetId }) => {
    const user = requireUser(request);
    return callSheetsService.get(user.id, callSheetId);
  }
);

export const PATCH = withParamsRoute<{ callSheetId: string }>(
  async (request: NextRequest, { callSheetId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      UpdateCallSheetDto,
      await readJsonBody(request)
    );
    return callSheetsService.update(user.id, callSheetId, dto);
  }
);

export const DELETE = withParamsRoute<{ callSheetId: string }>(
  async (request: NextRequest, { callSheetId }) => {
    const user = requireUser(request);
    await callSheetsService.remove(user.id, callSheetId);
    return { success: true };
  }
);
