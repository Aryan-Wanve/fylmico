import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser
} from "../common/guards/jwt-auth.guard";
import { CursorPaginationDto } from "../common/pagination";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectsService } from "./projects.service";

@Controller("houses/:houseId/projects")
@UseGuards(JwtAuthGuard)
export class HouseProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param("houseId") houseId: string,
    @Body() dto: CreateProjectDto
  ) {
    const data = await this.projectsService.create(user.id, houseId, dto);
    return { data };
  }

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Param("houseId") houseId: string,
    @Query() pagination: CursorPaginationDto
  ) {
    return this.projectsService.list(user.id, houseId, pagination);
  }
}
