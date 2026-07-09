import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser
} from "../common/guards/jwt-auth.guard";
import { WorkspaceService } from "./workspace.service";

@Controller("workspace")
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  async getWorkspace(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.workspaceService.getWorkspace(user.id);
    return { data };
  }
}
