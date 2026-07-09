import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser
} from "../common/guards/jwt-auth.guard";
import { LinkClientDto } from "./dto/link-client.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectsService } from "./projects.service";

@Controller("projects/:projectId")
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async get(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string
  ) {
    const data = await this.projectsService.get(user.id, projectId);
    return { data };
  }

  @Patch()
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Body() dto: UpdateProjectDto
  ) {
    const data = await this.projectsService.update(user.id, projectId, dto);
    return { data };
  }

  @Post("archive")
  async archive(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string
  ) {
    const data = await this.projectsService.archive(user.id, projectId);
    return { data };
  }

  @Post("clients")
  async linkClient(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Body() dto: LinkClientDto
  ) {
    const data = await this.projectsService.linkClient(user.id, projectId, dto);
    return { data };
  }
}
