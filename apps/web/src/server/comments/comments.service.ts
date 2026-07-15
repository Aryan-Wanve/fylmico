import type { Comment } from "@fylmico/database";
import { AppException, HttpStatus } from "../http";
import { notificationsService } from "../notifications/notifications.service";
import { organizationsService } from "../organizations/organizations.service";
import {
  buildPage,
  resolveLimit,
  type CursorPaginationDto,
  type Page
} from "../pagination";
import { prisma } from "../prisma";

type CommentDto = ReturnType<typeof toCommentDto>;

function excerpt(body: string, maxLength = 120): string {
  const trimmed = body.trim();
  return trimmed.length > maxLength
    ? `${trimmed.slice(0, maxLength - 1)}…`
    : trimmed;
}

class CommentsService {
  private readonly prisma = prisma;

  async createForTask(
    userId: string,
    taskId: string,
    body: string
  ): Promise<CommentDto> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { assignees: true }
    });
    if (!task) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "task_not_found",
        "This task does not exist."
      );
    }

    const comment = await this.create(
      userId,
      task.organizationId,
      "task",
      taskId,
      body
    );

    const recipientIds = task.assignees
      .map((a) => a.userId)
      .filter((id) => id !== userId);
    await Promise.all(
      recipientIds.map((recipientId) =>
        notificationsService.create(
          recipientId,
          "task_comment",
          `New comment on "${task.title}"`,
          `${comment.authorName} commented: ${excerpt(body)}`,
          task.organizationId
        )
      )
    );

    await this.notifyMentions(task.organizationId, taskId, body, comment);

    return comment;
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
    const comment = await this.create(
      userId,
      project.organizationId,
      "project",
      projectId,
      body
    );

    const recipientIds = project.teamIds.filter((id) => id !== userId);
    await Promise.all(
      recipientIds.map((recipientId) =>
        notificationsService.create(
          recipientId,
          "project_comment",
          `New comment on "${project.name}"`,
          `${comment.authorName} commented: ${excerpt(body)}`,
          project.organizationId
        )
      )
    );

    return comment;
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

  private async notifyMentions(
    organizationId: string,
    taskId: string,
    body: string,
    comment: CommentDto
  ): Promise<void> {
    const members = await this.prisma.organizationMembership.findMany({
      where: { organizationId },
      include: { user: true }
    });

    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    const mentioned = members.filter(
      (m) => m.userId !== comment.authorId && body.includes(`@${m.user.name}`)
    );

    await Promise.all(
      mentioned.map((m) =>
        notificationsService.create(
          m.userId,
          "task_mentioned",
          `You were mentioned on "${task?.title ?? "a task"}"`,
          `${comment.authorName} mentioned you: ${excerpt(body)}`,
          organizationId
        )
      )
    );
  }

  private async create(
    userId: string,
    organizationId: string,
    commentableType: string,
    commentableId: string,
    body: string
  ): Promise<CommentDto> {
    await organizationsService.requireMembership(organizationId, userId);

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
    await organizationsService.requireMembership(organizationId, userId);

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

export const commentsService = new CommentsService();

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
