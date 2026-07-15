import type { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/require-user";
import { filesService } from "@/server/files/files.service";
import { AddToPortfolioDto } from "@/server/files/dto/add-to-portfolio.dto";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ houseId: string; entryId: string }>(
  async (request: NextRequest, { houseId, entryId }) => {
    const user = requireUser(request);
    const dto = await validateDto(
      AddToPortfolioDto,
      await readJsonBody(request)
    );
    return filesService.addToPortfolio(
      user.id,
      houseId,
      entryId,
      dto.category ?? "Misc"
    );
  }
);
