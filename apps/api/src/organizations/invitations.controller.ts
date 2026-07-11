import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser
} from "../common/guards/jwt-auth.guard";
import { OrganizationsService } from "./organizations.service";

@Controller("invitations")
export class InvitationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get(":token")
  async preview(@Param("token") token: string) {
    const data = await this.organizationsService.getInvitationPreview(token);
    return { data };
  }

  @Post(":token/accept")
  @UseGuards(JwtAuthGuard)
  async accept(
    @CurrentUser() user: AuthenticatedUser,
    @Param("token") token: string
  ) {
    const data = await this.organizationsService.acceptInvitation(
      user.id,
      token
    );
    return { data };
  }
}
