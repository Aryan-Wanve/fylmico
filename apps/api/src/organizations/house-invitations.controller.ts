import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser
} from "../common/guards/jwt-auth.guard";
import { InviteMemberDto } from "./dto/invite-member.dto";
import { OrganizationsService } from "./organizations.service";

@Controller("houses/:houseId/invitations")
@UseGuards(JwtAuthGuard)
export class HouseInvitationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  async invite(
    @CurrentUser() user: AuthenticatedUser,
    @Param("houseId") houseId: string,
    @Body() dto: InviteMemberDto
  ) {
    const data = await this.organizationsService.inviteMember(
      houseId,
      user.id,
      dto
    );
    return { data };
  }

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Param("houseId") houseId: string
  ) {
    const data = await this.organizationsService.listInvitations(
      houseId,
      user.id
    );
    return { data };
  }

  @Delete(":invitationId")
  @HttpCode(HttpStatus.OK)
  async revoke(
    @CurrentUser() user: AuthenticatedUser,
    @Param("houseId") houseId: string,
    @Param("invitationId") invitationId: string
  ) {
    await this.organizationsService.revokeInvitation(
      houseId,
      user.id,
      invitationId
    );
    return { data: { success: true } };
  }
}
