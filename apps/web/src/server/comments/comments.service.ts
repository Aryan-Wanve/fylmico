import { Prisma, type Comment } from "@fylmico/database";
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

type CommentReaction = { emoji: string; userId: string; userName: string };

interface CommentDto {
  id: string;
  body: string;
  authorId: string | null;
  authorName: string;
  authorType: string;
  parentId: string | null;
  timestampSeconds: number | null;
  frameNumber: number | null;
  mentionedUserIds: string[];
  reactions: CommentReaction[];
  pinned: boolean;
  resolvedAt: Date | null;
  resolvedById: string | null;
  resolvedByName: string | null;
  createdAt: Date;
  updatedAt: Date;
  replies: CommentDto[];
}

export const REACTION_EMOJIS = ["👍", "❤️", "😂", "🎉", "😮", "👀"];

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

  async createForDeliverable(
    userId: string,
    deliverableId: string,
    body: string,
    timestampSeconds?: number,
    frameNumber?: number,
    parentId?: string,
    mentionedUserIds?: string[]
  ): Promise<CommentDto> {
    const deliverable = await this.prisma.deliverable.findUnique({
      where: { id: deliverableId },
      include: {
        project: true,
        client: true,
        task: { include: { assignees: true } }
      }
    });
    if (!deliverable) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "deliverable_not_found",
        "This deliverable does not exist."
      );
    }

    // Flatten to a single level of nesting - if the target parent is
    // itself a reply, attach the new comment to its root instead so the
    // thread UI never has to render more than one indent level.
    let resolvedParentId: string | undefined;
    if (parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: parentId }
      });
      // A stale/invalid/cross-deliverable parentId would otherwise hit a
      // Prisma FK violation (parent doesn't exist) or silently attach a
      // reply to a different deliverable's thread (parent exists but
      // belongs elsewhere) - both are just posted as a top-level comment
      // instead of failing the whole request.
      if (
        parent &&
        parent.commentableType === "deliverable" &&
        parent.commentableId === deliverableId
      ) {
        resolvedParentId = parent.parentId ?? parentId;
      }
    }

    const comment = await this.create(
      userId,
      deliverable.organizationId,
      "deliverable",
      deliverableId,
      body,
      timestampSeconds,
      { frameNumber, parentId: resolvedParentId, mentionedUserIds }
    );

    const ownerName =
      deliverable.project?.name ?? deliverable.client?.name ?? "deliverable";

    // Comment notifications go to whoever is actually attached to the
    // review (editor + task assignees) rather than project.teamIds, since
    // client-owned deliverables have no team list and would otherwise
    // silently notify nobody.
    const recipientIds = new Set<string>();
    recipientIds.add(deliverable.createdById);
    for (const assignee of deliverable.task?.assignees ?? []) {
      recipientIds.add(assignee.userId);
    }
    recipientIds.delete(userId);

    await Promise.all(
      [...recipientIds].map((recipientId) =>
        notificationsService.create(
          recipientId,
          "deliverable_comment",
          `New comment on "${ownerName}" v${deliverable.version}`,
          `${comment.authorName} commented: ${excerpt(body)}`,
          deliverable.organizationId
        )
      )
    );

    if (mentionedUserIds && mentionedUserIds.length > 0) {
      const mentioned = mentionedUserIds.filter((id) => id !== userId);
      await Promise.all(
        mentioned.map((recipientId) =>
          notificationsService.create(
            recipientId,
            "deliverable_mentioned",
            `You were mentioned on "${ownerName}" v${deliverable.version}`,
            `${comment.authorName} mentioned you: ${excerpt(body)}`,
            deliverable.organizationId
          )
        )
      );
    }

    return comment;
  }

  async listForDeliverable(
    userId: string,
    deliverableId: string,
    pagination: CursorPaginationDto
  ): Promise<Page<CommentDto>> {
    const deliverable = await this.prisma.deliverable.findUnique({
      where: { id: deliverableId }
    });
    if (!deliverable) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "deliverable_not_found",
        "This deliverable does not exist."
      );
    }
    await organizationsService.requireMembership(
      deliverable.organizationId,
      userId
    );

    const limit = resolveLimit(pagination);
    const topLevel = await this.prisma.comment.findMany({
      where: {
        commentableType: "deliverable",
        commentableId: deliverableId,
        parentId: null
      },
      include: { author: true, resolvedBy: true },
      orderBy: { createdAt: "asc" },
      take: limit + 1,
      ...(pagination.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {})
    });

    const page = buildPage(topLevel, limit, pagination.cursor);

    const replies =
      page.data.length > 0
        ? await this.prisma.comment.findMany({
            where: { parentId: { in: page.data.map((c) => c.id) } },
            include: { author: true, resolvedBy: true },
            orderBy: { createdAt: "asc" }
          })
        : [];

    return {
      ...page,
      data: page.data.map((comment) =>
        toCommentDto(
          comment,
          replies
            .filter((reply) => reply.parentId === comment.id)
            .map((reply) => toCommentDto(reply))
        )
      )
    };
  }

  async resolveComment(
    userId: string,
    deliverableId: string,
    commentId: string
  ): Promise<CommentDto> {
    const comment = await this.requireDeliverableComment(
      deliverableId,
      commentId
    );
    await organizationsService.requireMembership(
      comment.organizationId,
      userId
    );
    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { resolvedAt: new Date(), resolvedById: userId },
      include: { author: true, resolvedBy: true }
    });
    return toCommentDto(updated);
  }

  async reopenComment(
    userId: string,
    deliverableId: string,
    commentId: string
  ): Promise<CommentDto> {
    const comment = await this.requireDeliverableComment(
      deliverableId,
      commentId
    );
    await organizationsService.requireMembership(
      comment.organizationId,
      userId
    );
    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { resolvedAt: null, resolvedById: null },
      include: { author: true, resolvedBy: true }
    });
    return toCommentDto(updated);
  }

  async toggleCommentReaction(
    userId: string,
    deliverableId: string,
    commentId: string,
    emoji: string
  ): Promise<CommentDto> {
    if (!REACTION_EMOJIS.includes(emoji)) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "That's not a supported reaction."
      );
    }
    const comment = await this.requireDeliverableComment(
      deliverableId,
      commentId
    );
    await organizationsService.requireMembership(
      comment.organizationId,
      userId
    );
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true }
    });
    const userName = user.name;

    // Read-modify-write on a JSON array can't use a WHERE-clause CAS the
    // way a scalar column update could, so two concurrent toggles (or a
    // double-click) racing this method could clobber each other. A
    // Serializable transaction re-reads the row inside the transaction and
    // has Postgres abort one side of a genuine conflict (mapped to a
    // retryable 409 below) rather than silently dropping a reaction.
    let updated;
    try {
      updated = await this.prisma.$transaction(
        async (tx) => {
          const fresh = await tx.comment.findUniqueOrThrow({
            where: { id: commentId }
          });
          const existing = Array.isArray(fresh.reactions)
            ? (fresh.reactions as unknown as CommentReaction[])
            : [];
          const alreadyReacted = existing.some(
            (r) => r.userId === userId && r.emoji === emoji
          );
          const next = alreadyReacted
            ? existing.filter(
                (r) => !(r.userId === userId && r.emoji === emoji)
              )
            : [...existing, { emoji, userId, userName }];

          return tx.comment.update({
            where: { id: commentId },
            data: { reactions: next },
            include: { author: true, resolvedBy: true }
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034"
      ) {
        throw new AppException(
          HttpStatus.CONFLICT,
          "reaction_conflict",
          "Someone else just reacted to this comment - please retry."
        );
      }
      throw error;
    }
    return toCommentDto(updated);
  }

  async togglePin(
    userId: string,
    deliverableId: string,
    commentId: string
  ): Promise<CommentDto> {
    const comment = await this.requireDeliverableComment(
      deliverableId,
      commentId
    );
    await organizationsService.requireManagerRole(
      comment.organizationId,
      userId,
      "pin a comment"
    );
    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { pinned: !comment.pinned },
      include: { author: true, resolvedBy: true }
    });
    return toCommentDto(updated);
  }

  async updateComment(
    userId: string,
    deliverableId: string,
    commentId: string,
    body: string
  ): Promise<CommentDto> {
    const comment = await this.requireDeliverableComment(
      deliverableId,
      commentId
    );
    if (comment.authorId !== userId) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        "not_author",
        "You can only edit your own comments."
      );
    }
    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { body: body.trim() },
      include: { author: true, resolvedBy: true }
    });
    return toCommentDto(updated);
  }

  async deleteComment(
    userId: string,
    deliverableId: string,
    commentId: string
  ): Promise<void> {
    const comment = await this.requireDeliverableComment(
      deliverableId,
      commentId
    );
    if (comment.authorId !== userId) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        "not_author",
        "You can only delete your own comments."
      );
    }
    await this.prisma.comment.delete({ where: { id: commentId } });
  }

  // Also enforces that commentId actually belongs to deliverableId - the
  // route param used to be accepted but never checked, so any comment id
  // (including a task/project comment's) could be resolved/pinned/
  // reacted-to/edited/deleted through the deliverable-scoped routes as
  // long as the caller belonged to the same organization.
  private async requireDeliverableComment(
    deliverableId: string,
    commentId: string
  ): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId }
    });
    if (
      !comment ||
      comment.commentableType !== "deliverable" ||
      comment.commentableId !== deliverableId
    ) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "comment_not_found",
        "This comment no longer exists."
      );
    }
    return comment;
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
    body: string,
    timestampSeconds?: number,
    extra?: {
      frameNumber?: number;
      parentId?: string;
      mentionedUserIds?: string[];
    }
  ): Promise<CommentDto> {
    await organizationsService.requireMembership(organizationId, userId);

    const comment = await this.prisma.comment.create({
      data: {
        organizationId,
        commentableType,
        commentableId,
        authorId: userId,
        body: body.trim(),
        timestampSeconds: timestampSeconds ?? null,
        frameNumber: extra?.frameNumber ?? null,
        parentId: extra?.parentId ?? null,
        mentionedUserIds: extra?.mentionedUserIds ?? []
      },
      include: { author: true, resolvedBy: true }
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
      include: { author: true, resolvedBy: true },
      orderBy: { createdAt: "asc" },
      take: limit + 1,
      ...(pagination.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {})
    });

    const page = buildPage(comments, limit, pagination.cursor);
    return { ...page, data: page.data.map((c) => toCommentDto(c)) };
  }
}

export const commentsService = new CommentsService();

function toCommentDto(
  comment: Comment & {
    author?: { id: string; name: string } | null;
    resolvedBy?: { id: string; name: string } | null;
  },
  replies: CommentDto[] = []
): CommentDto {
  return {
    id: comment.id,
    body: comment.body,
    authorId: comment.authorId,
    authorName: comment.author?.name ?? comment.guestName ?? "Client",
    authorType: comment.authorType,
    parentId: comment.parentId,
    timestampSeconds: comment.timestampSeconds,
    frameNumber: comment.frameNumber,
    mentionedUserIds: comment.mentionedUserIds,
    reactions: Array.isArray(comment.reactions)
      ? (comment.reactions as unknown as CommentReaction[])
      : [],
    pinned: comment.pinned,
    resolvedAt: comment.resolvedAt,
    resolvedById: comment.resolvedById,
    resolvedByName: comment.resolvedBy?.name ?? null,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    replies
  };
}
