import { Prisma } from "@fylmico/database";
import { commentsService } from "../comments/comments.service";
import { driveStructureService } from "../drive/drive-structure.service";
import { AppException, HttpStatus } from "../http";
import { notificationsService } from "../notifications/notifications.service";
import { organizationsService } from "../organizations/organizations.service";
import { ownerWhere, resolveOwner, toOwnerDto } from "../owners/owners.util";
import { prisma } from "../prisma";
import { tasksService } from "../tasks/tasks.service";
import type { ApproveDeliverableDto } from "./dto/approve-deliverable.dto";
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

export type ReviewBulkAction =
  "approve" | "request-revision" | "reassign" | "reject";

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

    // Version numbering is per-owner and, when linked to a task, backstopped
    // by a partial unique index on (task_id, version) - the Serializable
    // transaction closes the count-then-create race under normal load, and
    // the index guarantees no duplicate ever commits even if two submits
    // land in the same instant.
    let deliverable: DeliverableWithRelations;
    try {
      deliverable = await this.prisma.$transaction(
        async (tx) => {
          const existingCount = await tx.deliverable.count({
            where: ownerWhere(owner)
          });
          return tx.deliverable.create({
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
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppException(
          HttpStatus.CONFLICT,
          "version_conflict",
          "Another version was just submitted for this task - please retry."
        );
      }
      throw error;
    }

    if (dto.taskId) {
      await this.logActivity(
        deliverable.id,
        userId,
        "version_uploaded",
        undefined,
        `v${deliverable.version}`
      );
    }

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
    // The Review inbox itself is manager-only, but an editor is always
    // allowed to see their own submission history (crew profile's
    // "Submitted Work" panel relies on this self-scoped view).
    if (filters.editorId === userId) {
      await organizationsService.requireMembership(houseId, userId);
    } else {
      await organizationsService.requireManagerRole(
        houseId,
        userId,
        "view the review queue"
      );
    }

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

    const unresolvedCounts = await this.getUnresolvedCommentCounts(
      deliverables.map((d) => d.id)
    );

    // Client-owned or task-less deliverables now appear in the queue too -
    // they used to be silently dropped here even though they support the
    // full comment/approve/reject flow.
    let items = deliverables.map((d) =>
      toQueueItemDto(d, unresolvedCounts.get(d.id) ?? 0)
    );

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

  // Single-item fetch for the review workspace route (direct navigation /
  // deep links, not just opening from an already-loaded queue list) - same
  // self-or-manager gate as listQueue.
  async getQueueItem(userId: string, deliverableId: string) {
    const deliverable = await this.prisma.deliverable.findUnique({
      where: { id: deliverableId },
      include: queueInclude
    });
    if (!deliverable) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "deliverable_not_found",
        "This deliverable does not exist."
      );
    }
    if (deliverable.createdById === userId) {
      await organizationsService.requireMembership(
        deliverable.organizationId,
        userId
      );
    } else {
      await organizationsService.requireManagerRole(
        deliverable.organizationId,
        userId,
        "view this submission"
      );
    }
    const unresolvedCount = await this.prisma.comment.count({
      where: {
        commentableType: "deliverable",
        commentableId: deliverableId,
        resolvedAt: null
      }
    });
    return toQueueItemDto(deliverable, unresolvedCount);
  }

  private async getUnresolvedCommentCounts(
    deliverableIds: string[]
  ): Promise<Map<string, number>> {
    if (deliverableIds.length === 0) return new Map();
    const groups = await this.prisma.comment.groupBy({
      by: ["commentableId"],
      where: {
        commentableType: "deliverable",
        commentableId: { in: deliverableIds },
        resolvedAt: null
      },
      _count: { id: true }
    });
    return new Map(groups.map((g) => [g.commentableId, g._count.id]));
  }

  async getMetrics(userId: string, houseId: string) {
    await organizationsService.requireManagerRole(
      houseId,
      userId,
      "view review metrics"
    );

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
            status: "approved",
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

  // Called by the review workspace route the first time a manager opens a
  // deliverable - logs a one-time "review started" event and pings the
  // editor, so they know their draft is actually being looked at.
  async markFirstReviewed(userId: string, deliverableId: string) {
    const deliverable = await this.findOrThrow(deliverableId);
    await organizationsService.requireManagerRole(
      deliverable.organizationId,
      userId,
      "review a submission"
    );

    if (deliverable.firstReviewedAt) {
      return toDeliverableDto(deliverable);
    }

    const updated = await this.prisma.deliverable.update({
      where: { id: deliverableId },
      data: { firstReviewedAt: new Date() },
      include: deliverableInclude
    });

    await this.logActivity(deliverableId, userId, "review_started");

    if (deliverable.createdById !== userId) {
      await notificationsService.create(
        deliverable.createdById,
        "deliverable_review_started",
        `Review started: v${deliverable.version}`,
        "A reviewer has started looking at your submission.",
        deliverable.organizationId
      );
    }

    return toDeliverableDto(updated);
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

    await this.logActivity(
      deliverableId,
      userId,
      "changes_requested",
      deliverable.status,
      "revision"
    );

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

  async reject(userId: string, deliverableId: string, reason: string) {
    const deliverable = await this.findOrThrow(deliverableId);
    await organizationsService.requireManagerRole(
      deliverable.organizationId,
      userId,
      "reject a submission"
    );

    const updated = await this.transition(userId, deliverableId, {
      status: "rejected",
      rejectionReason: reason.trim()
    });

    await this.logActivity(
      deliverableId,
      userId,
      "rejected",
      deliverable.status,
      "rejected"
    );

    if (deliverable.createdById !== userId) {
      await notificationsService.create(
        deliverable.createdById,
        "deliverable_rejected",
        `Rejected: v${deliverable.version}`,
        `Your submission was rejected: ${reason.trim()}`,
        deliverable.organizationId
      );
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

  async approve(
    userId: string,
    deliverableId: string,
    options: ApproveDeliverableDto = {}
  ) {
    const deliverable = await this.findOrThrow(deliverableId);
    await organizationsService.requireManagerRole(
      deliverable.organizationId,
      userId,
      "approve a submission"
    );

    const updated = await this.transition(userId, deliverableId, {
      status: "approved"
    });

    try {
      await this.onApproved(userId, deliverable, {
        deliverToClient: options.deliverToClient ?? true,
        addToPortfolio: options.addToPortfolio ?? false,
        portfolioCategory: options.portfolioCategory?.trim() || "Misc",
        finalName: options.finalName?.trim() || undefined,
        notes: options.notes?.trim() || undefined
      });
    } catch (error) {
      console.error(
        "[deliverables] could not finalize task / Deliveries copy / stats",
        error
      );
    }

    await this.logActivity(
      deliverableId,
      userId,
      "approved",
      deliverable.status,
      "approved"
    );

    if (deliverable.createdById !== userId) {
      await notificationsService.create(
        deliverable.createdById,
        "deliverable_approved",
        `Approved: v${deliverable.version}`,
        options.deliverToClient === false
          ? "Your submission was approved."
          : "Your submission was approved and delivered to the client.",
        deliverable.organizationId
      );
    }

    return updated;
  }

  async getEditorStats(userId: string, houseId: string, editorId: string) {
    if (editorId !== userId) {
      await organizationsService.requireManagerRole(
        houseId,
        userId,
        "view another editor's stats"
      );
    } else {
      await organizationsService.requireMembership(houseId, userId);
    }

    const deliverables = await this.prisma.deliverable.findMany({
      where: { organizationId: houseId, createdById: editorId },
      include: {
        project: true,
        client: true,
        fileEntry: { select: { durationSeconds: true } }
      }
    });

    const totalEdits = deliverables.length;
    const approved = deliverables.filter((d) => d.status === "approved");
    const totalDelivered = approved.length;
    const approvalRate =
      totalEdits > 0 ? Math.round((totalDelivered / totalEdits) * 100) : 0;
    const totalRuntimeSeconds = approved.reduce(
      (sum, d) => sum + (d.fileEntry.durationSeconds ?? 0),
      0
    );

    const projectNames = new Set<string>();
    const clientNames = new Set<string>();
    for (const d of deliverables) {
      if (d.project) projectNames.add(d.project.name);
      if (d.client) clientNames.add(d.client.name);
    }

    const versionsByTask = new Map<string, number>();
    for (const d of deliverables) {
      if (!d.taskId) continue;
      versionsByTask.set(
        d.taskId,
        Math.max(versionsByTask.get(d.taskId) ?? 0, d.version)
      );
    }
    const avgReviewIterations =
      versionsByTask.size > 0
        ? Math.round(
            ([...versionsByTask.values()].reduce((sum, v) => sum + v, 0) /
              versionsByTask.size) *
              10
          ) / 10
        : 0;

    const portfolioPieces = await this.prisma.fileEntry.count({
      where: {
        organizationId: houseId,
        uploadedById: editorId,
        driveKey: { startsWith: "portfolio:" }
      }
    });

    return {
      totalEdits,
      totalDelivered,
      projectsWorkedOn: projectNames.size,
      clientsWorkedFor: clientNames.size,
      approvalRate,
      avgReviewIterations,
      totalRuntimeSeconds,
      portfolioPieces
    };
  }

  async getActivity(userId: string, deliverableId: string) {
    const deliverable = await this.findOrThrow(deliverableId);
    await organizationsService.requireMembership(
      deliverable.organizationId,
      userId
    );

    const entries = await this.prisma.deliverableActivity.findMany({
      where: { deliverableId },
      include: { actor: true },
      orderBy: { createdAt: "asc" }
    });

    return entries.map((entry) => ({
      id: entry.id,
      type: entry.type,
      fromValue: entry.fromValue,
      toValue: entry.toValue,
      actorId: entry.actorId,
      actorName: entry.actor.name,
      createdAt: entry.createdAt.toISOString()
    }));
  }

  async bulkAction(
    userId: string,
    houseId: string,
    action: ReviewBulkAction,
    deliverableIds: string[],
    payload?: { comment?: string; newEditorId?: string; reason?: string }
  ) {
    const results: { id: string; ok: boolean; error?: string }[] = [];
    for (const id of deliverableIds) {
      try {
        if (action === "approve") {
          await this.approve(userId, id);
        } else if (action === "request-revision") {
          await this.requestRevision(userId, id, payload?.comment);
        } else if (action === "reject") {
          if (!payload?.reason) {
            throw new AppException(
              HttpStatus.BAD_REQUEST,
              "invalid_request",
              "reason is required to reject."
            );
          }
          await this.reject(userId, id, payload.reason);
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
    deliverable: DeliverableWithRelations,
    options: {
      deliverToClient: boolean;
      addToPortfolio: boolean;
      portfolioCategory: string;
      finalName?: string;
      notes?: string;
    }
  ): Promise<void> {
    const ownerKey = deliverable.projectId
      ? `project:${deliverable.projectId}`
      : `client:${deliverable.clientId}`;

    if (deliverable.taskId) {
      await tasksService.update(userId, deliverable.taskId, {
        status: "completed"
      });
    }

    if (options.notes) {
      await this.prisma.deliverable.update({
        where: { id: deliverable.id },
        data: { notes: options.notes }
      });
    }

    const finalName = options.finalName || deliverable.fileEntry.name;

    if (options.deliverToClient) {
      try {
        const deliveries = await driveStructureService.getFolderByKey(
          deliverable.organizationId,
          `${ownerKey}:Deliveries`
        );
        await this.prisma.fileEntry.create({
          data: {
            organizationId: deliverable.organizationId,
            parentId: deliveries.id,
            name: finalName,
            type: "file",
            storagePath: deliverable.fileEntry.storagePath,
            size: deliverable.fileEntry.size,
            mimeType: deliverable.fileEntry.mimeType,
            uploadedById: deliverable.createdById
          }
        });
        await this.logActivity(deliverable.id, userId, "delivered");
      } catch (error) {
        console.error(
          "[deliverables] could not copy final file into Deliveries",
          error
        );
      }
    }

    if (options.addToPortfolio) {
      try {
        const portfolioFolder = await driveStructureService.getFolderByKey(
          deliverable.organizationId,
          `portfolio:${options.portfolioCategory}`
        );
        await this.prisma.fileEntry.create({
          data: {
            organizationId: deliverable.organizationId,
            parentId: portfolioFolder.id,
            name: finalName,
            type: "file",
            storagePath: deliverable.fileEntry.storagePath,
            size: deliverable.fileEntry.size,
            mimeType: deliverable.fileEntry.mimeType,
            // Attributed to the editor (not the approving reviewer) so it
            // counts toward the editor's portfolio-pieces stat.
            uploadedById: deliverable.createdById
          }
        });
        await this.logActivity(deliverable.id, userId, "portfolio_added");
      } catch (error) {
        console.error(
          "[deliverables] could not copy final file into Portfolio",
          error
        );
      }
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

  private async logActivity(
    deliverableId: string,
    actorId: string,
    type: string,
    fromValue?: string,
    toValue?: string
  ): Promise<void> {
    try {
      await this.prisma.deliverableActivity.create({
        data: {
          deliverableId,
          actorId,
          type,
          fromValue: fromValue ?? null,
          toValue: toValue ?? null
        }
      });
    } catch (error) {
      console.error("[deliverables] could not log activity", error);
    }
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
    rejectionReason: deliverable.rejectionReason,
    firstReviewedAt: deliverable.firstReviewedAt?.toISOString() ?? null,
    exportSettings: deliverable.exportSettings,
    file: {
      id: deliverable.fileEntry.id,
      name: deliverable.fileEntry.name,
      size: deliverable.fileEntry.size,
      mimeType: deliverable.fileEntry.mimeType,
      durationSeconds: deliverable.fileEntry.durationSeconds
    },
    createdById: deliverable.createdById,
    createdByName: deliverable.createdBy.name,
    createdAt: deliverable.createdAt.toISOString(),
    updatedAt: deliverable.updatedAt.toISOString()
  };
}

function toQueueItemDto(
  deliverable: QueueDeliverable,
  unresolvedCommentCount = 0
) {
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
    rejectionReason: deliverable.rejectionReason,
    exportSettings: deliverable.exportSettings,
    unresolvedCommentCount,
    file: {
      id: deliverable.fileEntry.id,
      name: deliverable.fileEntry.name,
      size: deliverable.fileEntry.size,
      mimeType: deliverable.fileEntry.mimeType,
      durationSeconds: deliverable.fileEntry.durationSeconds
    },
    submittedAt: deliverable.createdAt.toISOString(),
    updatedAt: deliverable.updatedAt.toISOString(),
    task: Boolean(task)
  };
}
