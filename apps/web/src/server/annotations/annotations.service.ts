import type { Prisma } from "@fylmico/database";
import { AppException, HttpStatus } from "../http";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";

const annotationInclude = { author: true } satisfies Prisma.AnnotationInclude;
type AnnotationWithAuthor = Prisma.AnnotationGetPayload<{
  include: typeof annotationInclude;
}>;

export interface CreateAnnotationInput {
  timestampSeconds: number;
  frameNumber?: number;
  type: string;
  color: string;
  data: Record<string, unknown>;
  commentId?: string;
}

class AnnotationsService {
  private readonly prisma = prisma;

  async create(
    userId: string,
    deliverableId: string,
    input: CreateAnnotationInput
  ) {
    const deliverable = await this.requireDeliverable(deliverableId);
    await organizationsService.requireMembership(
      deliverable.organizationId,
      userId
    );

    if (input.commentId) {
      const comment = await this.prisma.comment.findUnique({
        where: { id: input.commentId }
      });
      if (
        !comment ||
        comment.commentableType !== "deliverable" ||
        comment.commentableId !== deliverableId
      ) {
        throw new AppException(
          HttpStatus.BAD_REQUEST,
          "invalid_request",
          "commentId must belong to this deliverable."
        );
      }
    }

    const annotation = await this.prisma.annotation.create({
      data: {
        organizationId: deliverable.organizationId,
        deliverableId,
        commentId: input.commentId ?? null,
        authorId: userId,
        timestampSeconds: input.timestampSeconds,
        frameNumber: input.frameNumber ?? null,
        type: input.type,
        color: input.color,
        data: input.data as Prisma.InputJsonValue
      },
      include: annotationInclude
    });

    return toAnnotationDto(annotation);
  }

  async listForDeliverable(userId: string, deliverableId: string) {
    const deliverable = await this.requireDeliverable(deliverableId);
    await organizationsService.requireMembership(
      deliverable.organizationId,
      userId
    );

    const annotations = await this.prisma.annotation.findMany({
      where: { deliverableId },
      include: annotationInclude,
      orderBy: { timestampSeconds: "asc" }
    });

    return annotations.map(toAnnotationDto);
  }

  async delete(userId: string, annotationId: string): Promise<void> {
    const annotation = await this.prisma.annotation.findUnique({
      where: { id: annotationId }
    });
    if (!annotation) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "annotation_not_found",
        "This annotation no longer exists."
      );
    }
    if (annotation.authorId !== userId) {
      await organizationsService.requireManagerRole(
        annotation.organizationId,
        userId,
        "delete another reviewer's annotation"
      );
    }
    await this.prisma.annotation.delete({ where: { id: annotationId } });
  }

  private async requireDeliverable(deliverableId: string) {
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
    return deliverable;
  }
}

export const annotationsService = new AnnotationsService();

function toAnnotationDto(annotation: AnnotationWithAuthor) {
  return {
    id: annotation.id,
    deliverableId: annotation.deliverableId,
    commentId: annotation.commentId,
    authorId: annotation.authorId,
    authorName: annotation.author.name,
    timestampSeconds: annotation.timestampSeconds,
    frameNumber: annotation.frameNumber,
    type: annotation.type,
    color: annotation.color,
    data: annotation.data,
    createdAt: annotation.createdAt
  };
}
