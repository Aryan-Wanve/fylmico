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
import { CommentsService } from "./comments.service";
import { CreateCommentDto } from "./dto/create-comment.dto";

@Controller("projects/:projectId/comments")
@UseGuards(JwtAuthGuard)
export class ProjectCommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Body() dto: CreateCommentDto
  ) {
    const data = await this.commentsService.createForProject(
      user.id,
      projectId,
      dto.body
    );
    return { data };
  }

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Param("projectId") projectId: string,
    @Query() pagination: CursorPaginationDto
  ) {
    return this.commentsService.listForProject(user.id, projectId, pagination);
  }
}
