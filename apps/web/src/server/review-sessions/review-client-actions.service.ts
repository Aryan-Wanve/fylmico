import { Prisma, type Comment } from "@fylmico/database";
import { REACTION_EMOJIS } from "../comments/comments.service";
import { signDownloadToken } from "../drive/drive-token.util";
import { deliverablesService } from "../deliverables/deliverables.service";
import { AppException, HttpStatus } from "../http";
import { getAppUrl } from "../mail/mailer";
import { notificationsService } from "../notifications/notifications.service";
import { prisma } from "../prisma";
import { broadcast, deliverableReviewTopic } from "../realtime/broadcast";
import { reviewSessionsService } from "./review-sessions.service";

type CommentReaction = { emoji: string; label: string; count: number };

interface ClientCommentDto {
  id: string;
  body: string;
  authorName: string;
  authorType: string;
  timestampSeconds: number | null;
  parentId: string | null;
  reactions: CommentReaction[];
  createdAt: string;
  replies: ClientCommentDto[];
}

const deliverableVersionInclude = {
  fileEntry: true
} satisfies Prisma.DeliverableInclude;

class ReviewClientActionsService {
  private readonly prisma = prisma;

  async getContent(
    token: string,
    cookieValue: string | undefined,
    requestedVersion?: number
  ) {
    const session = await reviewSessionsService.requireVerifiedSession(
      token,
      cookieValue
    );
    const viewed = await this.resolveViewedDeliverable(
      session,
      requestedVersion
    );

    const [comments, versions] = await Promise.all([
      this.listComments(viewed.id),
      session.allowVersionSwitch
        ? this.listVersions(session.deliverable.taskId)
        : Promise.resolve([])
    ]);

    return {
      status: session.status,
      videoUrl: `${getAppUrl()}/api/v1/files/download/${signDownloadToken(viewed.fileEntry.id)}`,
      videoTitle: viewed.fileEntry.name,
      version: viewed.version,
      isCurrentVersion: viewed.id === session.deliverableId,
      allowDownload: session.allowDownload,
      allowFullscreen: session.allowFullscreen,
      allowVersionSwitch: session.allowVersionSwitch,
      remainingSeconds: Math.max(
        0,
        Math.floor((session.expiresAt.getTime() - Date.now()) / 1000)
      ),
      comments,
      versions
    };
  }

  async addComment(
    token: string,
    cookieValue: string | undefined,
    dto: { body: string; timestampSeconds?: number; version?: number }
  ): Promise<ClientCommentDto> {
    const session = await reviewSessionsService.requireVerifiedSession(
      token,
      cookieValue
    );
    this.assertCommentable(session.status);
    const viewed = await this.resolveViewedDeliverable(session, dto.version);

    const comment = await this.prisma.comment.create({
      data: {
        organizationId: session.organizationId,
        commentableType: "deliverable",
        commentableId: viewed.id,
        authorType: "client",
        guestEmail: session.clientEmail,
        reviewSessionId: session.id,
        body: dto.body.trim(),
        timestampSeconds: dto.timestampSeconds ?? null
      }
    });

    await this.markReviewing(session.id);
    await broadcast(deliverableReviewTopic(session.deliverableId), "comment", {
      reviewSessionId: session.id,
      status: "reviewing"
    });
    await this.notifyEditor(
      session,
      "review_client_commented",
      `New client comment: v${viewed.version}`,
      `${session.clientEmail} left a comment on the review.`
    );

    return this.toClientCommentDto(comment, []);
  }

  async addReply(
    token: string,
    cookieValue: string | undefined,
    commentId: string,
    body: string
  ): Promise<ClientCommentDto> {
    const session = await reviewSessionsService.requireVerifiedSession(
      token,
      cookieValue
    );
    this.assertCommentable(session.status);
    const parent = await this.requireComment(session, commentId);

    const reply = await this.prisma.comment.create({
      data: {
        organizationId: session.organizationId,
        commentableType: "deliverable",
        commentableId: parent.commentableId,
        authorType: "client",
        guestEmail: session.clientEmail,
        reviewSessionId: session.id,
        parentId: parent.id,
        body: body.trim()
      }
    });

    await this.markReviewing(session.id);
    await broadcast(deliverableReviewTopic(session.deliverableId), "comment", {
      reviewSessionId: session.id,
      status: "reviewing"
    });
    await this.notifyEditor(
      session,
      "review_client_commented",
      `New client reply: v${session.deliverable.version}`,
      `${session.clientEmail} replied to a comment on the review.`
    );

    return this.toClientCommentDto(reply, []);
  }

  async toggleReaction(
    token: string,
    cookieValue: string | undefined,
    commentId: string,
    emoji: string
  ): Promise<ClientCommentDto> {
    if (!REACTION_EMOJIS.includes(emoji)) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "That's not a supported reaction."
      );
    }
    const session = await reviewSessionsService.requireVerifiedSession(
      token,
      cookieValue
    );
    const comment = await this.requireComment(session, commentId);

    const existing = Array.isArray(comment.reactions)
      ? (comment.reactions as unknown as {
          emoji: string;
          label: string;
        }[])
      : [];
    const label = session.clientEmail;
    const alreadyReacted = existing.some(
      (r) => r.emoji === emoji && r.label === label
    );
    const nextReactions = alreadyReacted
      ? existing.filter((r) => !(r.emoji === emoji && r.label === label))
      : [...existing, { emoji, label }];

    const updated = await this.prisma.comment.update({
      where: { id: comment.id },
      data: { reactions: nextReactions }
    });

    return this.toClientCommentDto(updated, []);
  }

  async approve(token: string, cookieValue: string | undefined): Promise<void> {
    const session = await reviewSessionsService.requireVerifiedSession(
      token,
      cookieValue
    );
    if (session.status === "approved") {
      return;
    }
    if (session.status === "expired" || session.status === "revoked") {
      throw new AppException(
        HttpStatus.GONE,
        "review_link_expired",
        "This review link is no longer active."
      );
    }

    await deliverablesService.approveViaClientReview(
      session.deliverableId,
      session.sentById,
      session.clientEmail
    );

    await this.prisma.reviewSession.update({
      where: { id: session.id },
      data: {
        status: "approved",
        approvedAt: new Date(),
        lastActivityAt: new Date()
      }
    });

    await broadcast(deliverableReviewTopic(session.deliverableId), "approved", {
      reviewSessionId: session.id,
      status: "approved"
    });
    await this.notifyEditor(
      session,
      "review_client_approved",
      `Approved by client: v${session.deliverable.version}`,
      `${session.clientEmail} approved this version.`
    );
  }

  async requestChanges(
    token: string,
    cookieValue: string | undefined,
    feedback: string
  ): Promise<void> {
    const session = await reviewSessionsService.requireVerifiedSession(
      token,
      cookieValue
    );
    if (session.status === "expired" || session.status === "revoked") {
      throw new AppException(
        HttpStatus.GONE,
        "review_link_expired",
        "This review link is no longer active."
      );
    }
    if (session.status === "approved") {
      throw new AppException(
        HttpStatus.CONFLICT,
        "already_approved",
        "This version was already approved."
      );
    }

    await deliverablesService.requestRevisionViaClientReview(
      session.deliverableId,
      session.sentById,
      session.clientEmail,
      feedback
    );

    await this.prisma.reviewSession.update({
      where: { id: session.id },
      data: {
        status: "changes_requested",
        changesRequestedAt: new Date(),
        lastActivityAt: new Date()
      }
    });

    await broadcast(
      deliverableReviewTopic(session.deliverableId),
      "changes_requested",
      { reviewSessionId: session.id, status: "changes_requested" }
    );
    await this.notifyEditor(
      session,
      "review_changes_requested",
      `Changes requested by client: v${session.deliverable.version}`,
      `${session.clientEmail} requested changes: ${feedback.trim()}`
    );
  }

  private assertCommentable(status: string): void {
    if (status === "approved" || status === "expired" || status === "revoked") {
      throw new AppException(
        HttpStatus.CONFLICT,
        "review_locked",
        "Comments are locked for this review link."
      );
    }
  }

  private async markReviewing(reviewSessionId: string): Promise<void> {
    await this.prisma.reviewSession.updateMany({
      where: { id: reviewSessionId, status: { in: ["pending", "viewed"] } },
      data: { status: "reviewing" }
    });
    await this.prisma.reviewSession.update({
      where: { id: reviewSessionId },
      data: { lastActivityAt: new Date() }
    });
  }

  private async notifyEditor(
    session: { deliverable: { createdById: string; version: number } },
    type: string,
    title: string,
    body: string
  ): Promise<void> {
    try {
      await notificationsService.create(
        session.deliverable.createdById,
        type,
        title,
        body
      );
    } catch (error) {
      console.error("[review-client-actions] could not notify editor", error);
    }
  }

  private async requireComment(
    session: { organizationId: string },
    commentId: string
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId }
    });
    if (!comment || comment.organizationId !== session.organizationId) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "comment_not_found",
        "This comment does not exist."
      );
    }
    return comment;
  }

  private async resolveViewedDeliverable(
    session: {
      deliverableId: string;
      allowVersionSwitch: boolean;
      deliverable: { id: string; version: number; taskId: string | null };
    },
    requestedVersion?: number
  ) {
    if (!requestedVersion || requestedVersion === session.deliverable.version) {
      const current = await this.prisma.deliverable.findUniqueOrThrow({
        where: { id: session.deliverableId },
        include: deliverableVersionInclude
      });
      return current;
    }

    if (!session.allowVersionSwitch || !session.deliverable.taskId) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        "version_switch_disabled",
        "Switching versions isn't allowed for this review link."
      );
    }

    const sibling = await this.prisma.deliverable.findFirst({
      where: {
        taskId: session.deliverable.taskId,
        version: requestedVersion
      },
      include: deliverableVersionInclude
    });
    if (!sibling) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "version_not_found",
        "That version does not exist."
      );
    }
    return sibling;
  }

  private async listVersions(taskId: string | null) {
    if (!taskId) {
      return [];
    }
    const siblings = await this.prisma.deliverable.findMany({
      where: { taskId },
      orderBy: { version: "asc" },
      select: { version: true, createdAt: true }
    });
    return siblings.map((s) => ({
      version: s.version,
      createdAt: s.createdAt.toISOString()
    }));
  }

  private async listComments(
    deliverableId: string
  ): Promise<ClientCommentDto[]> {
    const [topLevel, replies] = await Promise.all([
      this.prisma.comment.findMany({
        where: {
          commentableType: "deliverable",
          commentableId: deliverableId,
          parentId: null
        },
        include: { author: true },
        orderBy: { createdAt: "asc" }
      }),
      this.prisma.comment.findMany({
        where: {
          commentableType: "deliverable",
          commentableId: deliverableId,
          parentId: { not: null }
        },
        include: { author: true },
        orderBy: { createdAt: "asc" }
      })
    ]);

    return topLevel.map((comment) =>
      this.toClientCommentDto(
        comment,
        replies
          .filter((reply) => reply.parentId === comment.id)
          .map((reply) => this.toClientCommentDto(reply, []))
      )
    );
  }

  private toClientCommentDto(
    comment: Comment & { author?: { name: string } | null },
    replies: ClientCommentDto[]
  ): ClientCommentDto {
    const reactionEntries = Array.isArray(comment.reactions)
      ? (comment.reactions as unknown as { emoji: string; label: string }[])
      : [];
    const grouped = new Map<string, number>();
    for (const reaction of reactionEntries) {
      grouped.set(reaction.emoji, (grouped.get(reaction.emoji) ?? 0) + 1);
    }

    return {
      id: comment.id,
      body: comment.body,
      authorName:
        comment.authorType === "client"
          ? (comment.guestName ?? comment.guestEmail ?? "Client")
          : (comment.author?.name ?? "Team"),
      authorType: comment.authorType,
      timestampSeconds: comment.timestampSeconds,
      parentId: comment.parentId,
      reactions: [...grouped.entries()].map(([emoji, count]) => ({
        emoji,
        label: emoji,
        count
      })),
      createdAt: comment.createdAt.toISOString(),
      replies
    };
  }
}

export const reviewClientActionsService = new ReviewClientActionsService();
