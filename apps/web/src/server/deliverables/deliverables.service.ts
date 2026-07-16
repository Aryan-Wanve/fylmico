import type { Prisma } from "@fylmico/database";
import { AppException, HttpStatus } from "../http";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";
import type { CreateDeliverableDto } from "./dto/create-deliverable.dto";

const deliverableInclude = {
  fileEntry: true,
  createdBy: true
} satisfies Prisma.DeliverableInclude;

type DeliverableWithRelations = Prisma.DeliverableGetPayload<{
  include: typeof deliverableInclude;
}>;

class DeliverablesService {
  private readonly prisma = prisma;

  async create(userId: string, projectId: string, dto: CreateDeliverableDto) {
    const project = await this.requireProject(projectId);
    await organizationsService.requireMembership(
      project.organizationId,
      userId
    );

    if (dto.taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: dto.taskId }
      });
      if (!task || task.organizationId !== project.organizationId) {
        throw new AppException(
          HttpStatus.BAD_REQUEST,
          "invalid_request",
          "taskId must belong to this house."
        );
      }
    }

    const existingCount = await this.prisma.deliverable.count({
      where: { projectId }
    });

    const deliverable = await this.prisma.deliverable.create({
      data: {
        organizationId: project.organizationId,
        projectId,
        taskId: dto.taskId ?? null,
        fileEntryId: dto.fileEntryId,
        createdById: userId,
        version: existingCount + 1,
        notes: dto.notes?.trim() || null
      },
      include: deliverableInclude
    });

    return toDeliverableDto(deliverable);
  }

  async listForProject(userId: string, projectId: string) {
    const project = await this.requireProject(projectId);
    await organizationsService.requireMembership(
      project.organizationId,
      userId
    );

    const deliverables = await this.prisma.deliverable.findMany({
      where: { projectId },
      include: deliverableInclude,
      orderBy: { version: "asc" }
    });

    return deliverables.map(toDeliverableDto);
  }

  async requestRevision(userId: string, deliverableId: string) {
    return this.transition(userId, deliverableId, { status: "revision" });
  }

  async approve(userId: string, deliverableId: string) {
    const updated = await this.transition(userId, deliverableId, {
      status: "approved"
    });

    try {
      await this.onApproved(userId, deliverableId);
    } catch (error) {
      console.error(
        "[deliverables] could not create delivery task / bump progress",
        error
      );
    }

    return updated;
  }

  async markFinal(userId: string, deliverableId: string) {
    return this.transition(userId, deliverableId, { status: "final" });
  }

  private async onApproved(
    userId: string,
    deliverableId: string
  ): Promise<void> {
    const deliverable = await this.findOrThrow(deliverableId);
    const project = await this.prisma.project.findUniqueOrThrow({
      where: { id: deliverable.projectId }
    });

    await this.prisma.task.create({
      data: {
        organizationId: deliverable.organizationId,
        createdById: userId,
        projectId: deliverable.projectId,
        title: `Deliver v${deliverable.version} - ${project.name}`,
        type: "delivery"
      }
    });

    await this.prisma.project.update({
      where: { id: project.id },
      data: { progress: Math.min(100, project.progress + 10) }
    });
  }

  private async transition(
    userId: string,
    deliverableId: string,
    data: Prisma.DeliverableUpdateInput
  ) {
    const deliverable = await this.findOrThrow(deliverableId);
    await organizationsService.requireMembership(
      deliverable.organizationId,
      userId
    );

    const updated = await this.prisma.deliverable.update({
      where: { id: deliverableId },
      data,
      include: deliverableInclude
    });

    return toDeliverableDto(updated);
  }

  private async requireProject(projectId: string) {
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
    return project;
  }

  private async findOrThrow(
    deliverableId: string
  ): Promise<DeliverableWithRelations> {
    const deliverable = await this.prisma.deliverable.findUnique({
      where: { id: deliverableId },
      include: deliverableInclude
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

export const deliverablesService = new DeliverablesService();

function toDeliverableDto(deliverable: DeliverableWithRelations) {
  return {
    id: deliverable.id,
    projectId: deliverable.projectId,
    taskId: deliverable.taskId,
    version: deliverable.version,
    status: deliverable.status,
    notes: deliverable.notes,
    file: {
      id: deliverable.fileEntry.id,
      name: deliverable.fileEntry.name,
      size: deliverable.fileEntry.size,
      mimeType: deliverable.fileEntry.mimeType
    },
    createdById: deliverable.createdById,
    createdByName: deliverable.createdBy.name,
    createdAt: deliverable.createdAt.toISOString(),
    updatedAt: deliverable.updatedAt.toISOString()
  };
}
