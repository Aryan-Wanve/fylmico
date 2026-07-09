import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService, type Comment } from "@fylmico/database";
import {
  buildPage,
  resolveLimit,
  type CursorPaginationDto,
  type Page
} from "../common/pagination";
import { AppException } from "../common/exceptions/app.exception";
import { OrganizationsService } from "../organizations/organizations.service";

type CommentDto = ReturnType<typeof toCommentDto>;

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationsService: OrganizationsService
  ) {}

  async createForTask(
    userId: string,
    taskId: string,
    body: string
  ): Promise<CommentDto> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "task_not_found",
        "This task does not exist."
      );
    }
    return this.create(userId, task.organizationId, "task", taskId, body);
  }

  async listForTask(
    userId: string,
    taskId: string,
    pagination: CursorPaginationDto
  ): Promise<Page<CommentDto>> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "task_not_found",
        "This task does not exist."
      );
    }
    return this.list(userId, task.organizationId, "task", taskId, pagination);
  }

  async createForProject(
    userId: string,
    projectId: string,
    body: string
  ): Promise<CommentDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    });
    if (!project) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "project_not_found",
        "This project does not exist."
      );
    }
    return this.create(
      userId,
      project.organizationId,
      "project",
      projectId,
      body
    );
  }

  async listForProject(
    userId: string,
    projectId: string,
    pagination: CursorPaginationDto
  ): Promise<Page<CommentDto>> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    });
    if (!project) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "project_not_found",
        "This project does not exist."
      );
    }
    return this.list(
      userId,
      project.organizationId,
      "project",
      projectId,
      pagination
    );
  }

  private async create(
    userId: string,
    organizationId: string,
    commentableType: string,
    commentableId: string,
    body: string
  ): Promise<CommentDto> {
    await this.organizationsService.requireMembership(organizationId, userId);

    const comment = await this.prisma.comment.create({
      data: {
        organizationId,
        commentableType,
        commentableId,
        authorId: userId,
        body: body.trim()
      },
      include: { author: true }
    });

    return toCommentDto(comment);
  }

  private async list(
    userId: string,
    organizationId: string,
    commentableType: string,
    commentableId: string,
    pagination: CursorPaginationDto
  ): Promise<Page<CommentDto>> {
    await this.organizationsService.requireMembership(organizationId, userId);

    const limit = resolveLimit(pagination);
    const comments = await this.prisma.comment.findMany({
      where: { commentableType, commentableId },
      include: { author: true },
      orderBy: { createdAt: "asc" },
      take: limit + 1,
      ...(pagination.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {})
    });

    const page = buildPage(comments, limit, pagination.cursor);
    return { ...page, data: page.data.map(toCommentDto) };
  }
}

function toCommentDto(
  comment: Comment & { author: { id: string; name: string } }
) {
  return {
    id: comment.id,
    body: comment.body,
    authorId: comment.authorId,
    authorName: comment.author.name,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt
  };
}
