import type { NextRequest } from "next/server";
import { InviteMemberDto } from "@/server/organizations/dto/invite-member.dto";
import { organizationsService } from "@/server/organizations/organizations.service";
import { requireUser } from "@/server/auth/require-user";
import { readJsonBody, validateDto, withParamsRoute } from "@/server/http";

export const POST = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    const dto = await validateDto(InviteMemberDto, await readJsonBody(request));
    return organizationsService.inviteMember(houseId, user.id, dto);
  }
);

export const GET = withParamsRoute<{ houseId: string }>(
  async (request: NextRequest, { houseId }) => {
    const user = requireUser(request);
    return organizationsService.listInvitations(houseId, user.id);
  }
);
