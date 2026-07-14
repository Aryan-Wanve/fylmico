import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { callSheetsService } from "@/server/call-sheets/call-sheets.service";
import { CreateCallSheetDto } from "@/server/call-sheets/dto/create-call-sheet.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    return callSheetsService.list(user.id, houseId);
  }
);

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      CreateCallSheetDto,
      await readJsonBody(request)
    );
    return callSheetsService.create(user.id, houseId, dto);
  }
);
