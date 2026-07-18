import type { Prisma } from "@fylmico/database";
import { commentsService } from "../comments/comments.service";
import { driveStructureService } from "../drive/drive-structure.service";
import { AppException, HttpStatus } from "../http";
import { notificationsService } from "../notifications/notifications.service";
import { organizationsService } from "../organizations/organizations.service";
import { ownerWhere, resolveOwner, toOwnerDto } from "../owners/owners.util";
import { prisma } from "../prisma";
import { tasksService } from "../tasks/tasks.service";
import type { CreateDeliverableDto } from "./dto/create-deliverable.dto";

const deliverableInclude = {
  fileEntry: true,
  createdBy: true,
  project: true,
  client: true
} satisfies Prisma.DeliverableInclude;

type DeliverableWithRelations = Prisma.DeliverableGetPayload<{
  include: typeof deliverableInclude;
}>;

const queueInclude = {
  fileEntry: true,
  createdBy: true,
  project: true,
  client: true,
  task: {
    include: {
      assignees: { include: { user: true } },
      project: true,
      client: true
    }
  }
} satisfies Prisma.DeliverableInclude;

type QueueDeliverable = Prisma.DeliverableGetPayload<{
  include: typeof queueInclude;
}>;

export type ReviewQueueFilters = {
  projectId?: string;
  clientId?: string;
  editorId?: string;
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: "submittedAt" | "priority" | "version";
};

export type ReviewBulkAction = "approve" | "request-revision" | "reassign";

class DeliverablesService {
  private readonly prisma = prisma;

  async create(userId: string, houseId: string, dto: CreateDeliverableDto) {
    const owner = await resolveOwner(houseId, {
      ownerType: dto.ownerType,
      ownerId: dto.ownerId
    });
    await organizationsService.requireMembership(houseId, userId);

    if (dto.taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: dto.taskId }
      });
      if (!task || task.organizationId !== houseId) {
        throw new AppException(
          HttpStatus.BAD_REQUEST,
          "invalid_request",
          "taskId must belong to this house."
        );
      }
    }

    // Version numbering is per-owner (the old @@unique([projectId, version])
    // is gone, since a client-owned deliverable has no project).
    const existingCount = await this.prisma.deliverable.count({
      where: ownerWhere(owner)
    });

    const deliverable = await this.prisma.deliverable.create({
      data: {
        organizationId: houseId,
        ...ownerWhere(owner),
        taskId: dto.taskId ?? null,
        fileEntryId: dto.fileEntryId,
        createdById: userId,
        version: existingCount + 1,
        notes: dto.notes?.trim() || null,
        exportSettings: dto.exportSettings ?? undefined
      },
      include: deliverableInclude
    });

    return toDeliverableDto(deliverable);
  }

  // Thin wrapper for the project-scoped route, which knows the projectId
  // but not the houseId - resolve the project's house then delegate.
  async createForProject(
    userId: string,
    projectId: string,
    dto: CreateDeliverableDto
  ) {
    const project = await this.requireProject(projectId);
    return this.create(userId, project.organizationId, dto);
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

  async listForClient(userId: string, clientId: string) {
    const client = await this.requireClient(clientId);
    await organizationsService.requireMembership(client.organizationId, userId);

    const deliverables = await this.prisma.deliverable.findMany({
      where: { clientId },
      include: deliverableInclude,
      orderBy: { version: "asc" }
    });

    return deliverables.map(toDeliverableDto);
  }

  async listQueue(
    userId: string,
    houseId: string,
    filters: ReviewQueueFilters
  ) {
    await organizationsService.requireMembership(houseId, userId);

    const deliverables = await this.prisma.deliverable.findMany({
      where: {
        organizationId: houseId,
        status:
          filters.status && filters.status !== "all"
            ? filters.status
            : filters.status === "all"
              ? undefined
              : { in: ["review", "revision"] },
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(filters.editorId ? { createdById: filters.editorId } : {})
      },
      include: queueInclude,
      orderBy: { createdAt: "desc" }
    });

    let items = deliverables.map(toQueueItemDto).filter((item) => item.task);

    if (filters.clientId) {
      items = items.filter((item) => item.clientId === filters.clientId);
    }
    if (filters.priority) {
      items = items.filter((item) => item.priority === filters.priority);
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.taskTitle?.toLowerCase().includes(term) ||
          item.projectTitle?.toLowerCase().includes(term) ||
          item.clientName?.toLowerCase().includes(term) ||
          item.editorName?.toLowerCase().includes(term)
      );
    }

    const sortBy = filters.sortBy ?? "submittedAt";
    if (sortBy === "priority") {
      const rank: Record<string, number> = {
        urgent: 0,
        high: 1,
        medium: 2,
        low: 3
      };
      items = [...items].sort(
        (a, b) => (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9)
      );
    } else if (sortBy === "version") {
      items = [...items].sort((a, b) => b.version - a.version);
    }

    return items;
  }

  async getMetrics(userId: string, houseId: string) {
    await organizationsService.requireMembership(houseId, userId);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [waitingForReview, changesRequested, approvedToday, reviewItems] =
      await Promise.all([
        this.prisma.deliverable.count({
          where: { organizationId: houseId, status: "review" }
        }),
        this.prisma.deliverable.count({
          where: { organizationId: houseId, status: "revision" }
        }),
        this.prisma.deliverable.count({
          where: {
            organizationId: houseId,
            status: { in: ["approved", "final"] },
            updatedAt: { gte: startOfToday }
          }
        }),
        this.prisma.deliverable.findMany({
          where: { organizationId: houseId, status: "review" },
          select: { task: { select: { dueDate: true } } }
        })
      ]);

    const now = new Date();
    const overdueReviews = reviewItems.filter(
      (item) => item.task?.dueDate && item.task.dueDate < now
    ).length;

    return {
      waitingForReview,
      changesRequested,
      approvedToday,
      overdueReviews
    };
  }

  async requestRevision(
    userId: string,
    deliverableId: string,
    comment?: string
  ) {
    const deliverable = await this.findOrThrow(deliverableId);
    await organizationsService.requireManagerRole(
      deliverable.organizationId,
      userId,
      "request changes on a submission"
    );

    const updated = await this.transition(userId, deliverableId, {
      status: "revision"
    });

    if (deliverable.taskId) {
      try {
        await tasksService.update(userId, deliverable.taskId, {
          status: "in-progress"
        });
        if (comment?.trim()) {
          await commentsService.createForTask(
            userId,
            deliverable.taskId,
            comment.trim()
          );
        }
        const task = await this.prisma.task.findUnique({
          where: { id: deliverable.taskId },
          include: { assignees: true }
        });
        for (const assignee of task?.assignees ?? []) {
          if (assignee.userId !== userId) {
            await notificationsService.create(
              assignee.userId,
              "deliverable_changes_requested",
              `Changes requested: v${deliverable.version}`,
              comment?.trim()
                ? `The reviewer asked for changes: ${comment.trim()}`
                : "The reviewer asked for changes on your submission.",
              deliverable.organizationId
            );
          }
        }
      } catch (error) {
        console.error(
          "[deliverables] could not revert task / notify on request-revision",
          error
        );
      }
    }

    return updated;
  }

  async reassign(userId: string, deliverableId: string, newEditorId: string) {
    const deliverable = await this.findOrThrow(deliverableId);
    await organizationsService.requireManagerRole(
      deliverable.organizationId,
      userId,
      "reassign a submission"
    );

    if (!deliverable.taskId) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "This submission isn't linked to a task."
      );
    }

    const task = await this.prisma.task.findUnique({
      where: { id: deliverable.taskId },
      include: { assignees: true }
    });
    const previousEditorIds = (task?.assignees ?? [])
      .map((a) => a.userId)
      .filter((id) => id !== newEditorId);

    await tasksService.update(userId, deliverable.taskId, {
      assignees: [{ userId: newEditorId }]
    });

    await Promise.all(
      previousEditorIds.map((editorId) =>
        notificationsService.create(
          editorId,
          "deliverable_reassigned",
          `Reassigned: "${task?.title ?? "a task"}"`,
          `This task and its submission history were reassigned to another editor.`,
          deliverable.organizationId
        )
      )
    );

    return toDeliverableDto(await this.findOrThrow(deliverableId));
  }

  async approve(userId: string, deliverableId: string) {
    const deliverable = await this.findOrThrow(deliverableId);
    await organizationsService.requireManagerRole(
      deliverable.organizationId,
      userId,
      "approve a submission"
    );

    const updated = await this.transition(userId, deliverableId, {
      status: "final"
    });

    try {
      await this.onApproved(userId, deliverable);
    } catch (error) {
      console.error(
        "[deliverables] could not finalize task / Deliveries copy / stats",
        error
      );
    }

    if (deliverable.createdById !== userId) {
      await notificationsService.create(
        deliverable.createdById,
        "deliverable_approved",
        `Approved: v${deliverable.version}`,
        "Your submission was approved and delivered to the client.",
        deliverable.organizationId
      );
    }

    return updated;
  }

  async markFinal(userId: string, deliverableId: string) {
    const deliverable = await this.findOrThrow(deliverableId);
    await organizationsService.requireManagerRole(
      deliverable.organizationId,
      userId,
      "finalize a submission"
    );
    return this.transition(userId, deliverableId, { status: "final" });
  }

  async bulkAction(
    userId: string,
    houseId: string,
    action: ReviewBulkAction,
    deliverableIds: string[],
    payload?: { comment?: string; newEditorId?: string }
  ) {
    const results: { id: string; ok: boolean; error?: string }[] = [];
    for (const id of deliverableIds) {
      try {
        if (action === "approve") {
          await this.approve(userId, id);
        } else if (action === "request-revision") {
          await this.requestRevision(userId, id, payload?.comment);
        } else if (action === "reassign") {
          if (!payload?.newEditorId) {
            throw new AppException(
              HttpStatus.BAD_REQUEST,
              "invalid_request",
              "newEditorId is required to reassign."
            );
          }
          await this.reassign(userId, id, payload.newEditorId);
        }
        results.push({ id, ok: true });
      } catch (error) {
        results.push({
          id,
          ok: false,
          error: error instanceof Error ? error.message : "Failed"
        });
      }
    }
    return { results };
  }

  private async onApproved(
    userId: string,
    deliverable: DeliverableWithRelations
  ): Promise<void> {
    const ownerKey = deliverable.projectId
      ? `project:${deliverable.projectId}`
      : `client:${deliverable.clientId}`;

    if (deliverable.taskId) {
      await tasksService.update(userId, deliverable.taskId, {
        status: "completed"
      });
    }

    try {
      const deliveries = await driveStructureService.getFolderByKey(
        deliverable.organizationId,
        `${ownerKey}:Deliveries`
      );
      await this.prisma.fileEntry.create({
        data: {
          organizationId: deliverable.organizationId,
          parentId: deliveries.id,
          name: deliverable.fileEntry.name,
          type: "file",
          storagePath: deliverable.fileEntry.storagePath,
          size: deliverable.fileEntry.size,
          mimeType: deliverable.fileEntry.mimeType,
          uploadedById: deliverable.createdById
        }
      });
    } catch (error) {
      console.error(
        "[deliverables] could not copy final file into Deliveries",
        error
      );
    }

    // Project progress only applies to project-owned work; a client
    // workspace has no single "progress" rollup.
    if (!deliverable.projectId) {
      return;
    }
    const [taskCount, completedTaskCount] = await Promise.all([
      this.prisma.task.count({
        where: { projectId: deliverable.projectId, isTemplate: false }
      }),
      this.prisma.task.count({
        where: {
          projectId: deliverable.projectId,
          isTemplate: false,
          status: "completed"
        }
      })
    ]);
    const progress =
      taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 100;

    await this.prisma.project.update({
      where: { id: deliverable.projectId },
      data: { progress }
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

  private async requireClient(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId }
    });
    if (!client) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "client_not_found",
        "This client does not exist."
      );
    }
    return client;
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
  const owner = toOwnerDto(deliverable);
  return {
    id: deliverable.id,
    ownerType: owner?.ownerType ?? null,
    ownerId: owner?.ownerId ?? null,
    ownerName: owner?.ownerName ?? null,
    projectId: deliverable.projectId,
    taskId: deliverable.taskId,
    version: deliverable.version,
    status: deliverable.status,
    notes: deliverable.notes,
    exportSettings: deliverable.exportSettings,
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

function toQueueItemDto(deliverable: QueueDeliverable) {
  const task = deliverable.task;
  const owner = toOwnerDto(deliverable);
  const primaryAssignee = task?.assignees?.[0];

  return {
    id: deliverable.id,
    ownerType: owner?.ownerType ?? null,
    ownerId: owner?.ownerId ?? null,
    ownerName: owner?.ownerName ?? null,
    projectId: deliverable.projectId,
    projectTitle: deliverable.project?.name ?? null,
    clientId: deliverable.clientId,
    clientName: deliverable.client?.name ?? null,
    taskId: deliverable.taskId,
    taskTitle: task?.title ?? null,
    editorId: deliverable.createdById,
    editorName: deliverable.createdBy.name,
    assigneeId: primaryAssignee?.userId ?? null,
    assigneeName: primaryAssignee?.user.name ?? null,
    version: deliverable.version,
    status: deliverable.status,
    priority: task?.priority ?? "medium",
    dueDate: task?.dueDate?.toISOString() ?? null,
    notes: deliverable.notes,
    exportSettings: deliverable.exportSettings,
    file: {
      id: deliverable.fileEntry.id,
      name: deliverable.fileEntry.name,
      size: deliverable.fileEntry.size,
      mimeType: deliverable.fileEntry.mimeType
    },
    submittedAt: deliverable.createdAt.toISOString(),
    updatedAt: deliverable.updatedAt.toISOString(),
    task: Boolean(task)
  };
}
