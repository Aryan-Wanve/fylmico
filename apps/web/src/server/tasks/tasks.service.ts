import type { Prisma } from "@fylmico/database";
import { AppException, HttpStatus } from "../http";
import { notificationsService } from "../notifications/notifications.service";
import { organizationsService } from "../organizations/organizations.service";
import { toOwnerDto } from "../owners/owners.util";
import { prisma } from "../prisma";
import type { AddChecklistItemDto } from "./dto/add-checklist-item.dto";
import type { AddDependencyDto } from "./dto/add-dependency.dto";
import type { AddWorkLogDto } from "./dto/add-work-log.dto";
import type { CreateTaskDto } from "./dto/create-task.dto";
import type { StopTimerDto } from "./dto/stop-timer.dto";
import type { UpdateChecklistItemDto } from "./dto/update-checklist-item.dto";
import type { UpdateTaskDto } from "./dto/update-task.dto";

const taskInclude = {
  assignees: { include: { user: true } },
  checklistItems: { orderBy: { order: "asc" } },
  subtasks: { orderBy: { createdAt: "asc" } },
  attachments: true,
  project: true,
  client: true,
  board: true,
  script: true,
  shootDayEvent: true,
  createdBy: true,
  blockingOf: { include: { blockedTask: true } },
  blockedBy: { include: { blockingTask: true } }
} satisfies Prisma.TaskInclude;

type TaskWithRelations = Prisma.TaskGetPayload<{ include: typeof taskInclude }>;

class TasksService {
  private readonly prisma = prisma;

  async createTask(userId: string, dto: CreateTaskDto) {
    await organizationsService.requireMembership(dto.houseId, userId);

    const assigneeInputs = dto.assignees ?? [];
    if (assigneeInputs.length) {
      await this.requireMembers(
        dto.houseId,
        assigneeInputs.map((a) => a.userId)
      );
    }
    if (dto.projectId) {
      await this.requireProjectInHouse(dto.houseId, dto.projectId);
    }
    if (dto.clientId) {
      await this.requireClientInHouse(dto.houseId, dto.clientId);
    }
    if (dto.parentTaskId) {
      await this.requireTaskInHouse(dto.houseId, dto.parentTaskId);
    }

    const task = await this.prisma.task.create({
      data: {
        organizationId: dto.houseId,
        createdById: userId,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        type: dto.type ?? "custom",
        status: dto.status ?? "todo",
        priority: dto.priority ?? "medium",
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        estimatedMinutes: dto.estimatedMinutes,
        recurrenceRule: dto.recurrenceRule,
        recurrenceEndDate: dto.recurrenceEndDate
          ? new Date(dto.recurrenceEndDate)
          : null,
        projectId: dto.projectId ?? null,
        clientId: dto.projectId ? null : (dto.clientId ?? null),
        boardId: dto.boardId,
        scriptId: dto.scriptId,
        shootDayEventId: dto.shootDayEventId,
        parentTaskId: dto.parentTaskId,
        equipment: dto.equipment ?? [],
        location: dto.location,
        callTime: dto.callTime,
        deliverables: dto.deliverables ?? [],
        tags: dto.tags ?? [],
        assignees: assigneeInputs.length
          ? {
              create: assigneeInputs.map((a) => ({
                userId: a.userId,
                responsibility: a.responsibility?.trim() || null
              }))
            }
          : undefined
      },
      include: taskInclude
    });

    await this.logActivity(task.id, userId, "created");

    for (const assignee of assigneeInputs) {
      if (assignee.userId !== userId) {
        await notificationsService.create(
          assignee.userId,
          "task_assigned",
          `New task: ${task.title}`,
          `You were assigned "${task.title}"${
            task.dueDate ? `, due ${task.dueDate.toLocaleDateString()}` : ""
          }.`,
          task.organizationId
        );
      }
    }

    return toTaskDto(task);
  }

  async getTask(userId: string, taskId: string) {
    const task = await this.findTaskOrThrow(taskId);
    await organizationsService.requireMembership(task.organizationId, userId);
    return toTaskDto(task);
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    const existing = await this.findTaskOrThrow(taskId);
    await organizationsService.requireMembership(
      existing.organizationId,
      userId
    );

    if (dto.assignees) {
      await this.requireMembers(
        existing.organizationId,
        dto.assignees.map((a) => a.userId)
      );
    }
    if (dto.projectId) {
      await this.requireProjectInHouse(existing.organizationId, dto.projectId);
    }
    if (dto.clientId) {
      await this.requireClientInHouse(existing.organizationId, dto.clientId);
    }

    if (dto.status !== undefined && dto.status !== existing.status) {
      await this.logActivity(
        taskId,
        userId,
        "status_changed",
        existing.status,
        dto.status
      );
      if (dto.status === "review") {
        await notificationsService.create(
          existing.createdById,
          "task_review_requested",
          `Review requested: "${existing.title}"`,
          `"${existing.title}" is ready for review.`,
          existing.organizationId
        );
      }
      if (dto.status === "completed") {
        await notificationsService.create(
          existing.createdById,
          "task_completed",
          `Task completed: "${existing.title}"`,
          `"${existing.title}" was marked completed.`,
          existing.organizationId
        );
      }
      if (dto.status === "changes-requested") {
        for (const assignee of existing.assignees) {
          if (assignee.userId !== userId) {
            await notificationsService.create(
              assignee.userId,
              "task_status_changed",
              `Changes requested: "${existing.title}"`,
              `"${existing.title}" needs changes before it can be approved.`,
              existing.organizationId
            );
          }
        }
      }
    }
    if (dto.priority !== undefined && dto.priority !== existing.priority) {
      await this.logActivity(
        taskId,
        userId,
        "priority_changed",
        existing.priority,
        dto.priority
      );
    }
    if (dto.dueDate !== undefined) {
      const nextDue = new Date(dto.dueDate).toISOString();
      const prevDue = existing.dueDate?.toISOString() ?? null;
      if (nextDue !== prevDue) {
        await this.logActivity(
          taskId,
          userId,
          "due_date_changed",
          prevDue,
          nextDue
        );
      }
    }

    if (dto.assignees) {
      const existingIds = new Set(existing.assignees.map((a) => a.userId));
      const nextIds = new Set(dto.assignees.map((a) => a.userId));
      const added = dto.assignees.filter((a) => !existingIds.has(a.userId));
      const removed = existing.assignees.filter((a) => !nextIds.has(a.userId));

      if (removed.length) {
        await this.prisma.taskAssignee.deleteMany({
          where: { taskId, userId: { in: removed.map((a) => a.userId) } }
        });
      }
      for (const a of dto.assignees) {
        await this.prisma.taskAssignee.upsert({
          where: { taskId_userId: { taskId, userId: a.userId } },
          create: {
            taskId,
            userId: a.userId,
            responsibility: a.responsibility?.trim() || null
          },
          update: { responsibility: a.responsibility?.trim() || null }
        });
      }
      for (const a of added) {
        await this.logActivity(taskId, userId, "assigned", null, a.userId);
        if (a.userId !== userId) {
          await notificationsService.create(
            a.userId,
            "task_assigned",
            `New task: ${existing.title}`,
            `You were assigned "${existing.title}".`,
            existing.organizationId
          );
        }
      }
      for (const r of removed) {
        await this.logActivity(taskId, userId, "unassigned", r.userId, null);
      }
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() || null }
          : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
        ...(dto.dueDate !== undefined
          ? { dueDate: new Date(dto.dueDate) }
          : {}),
        ...(dto.startDate !== undefined
          ? { startDate: new Date(dto.startDate) }
          : {}),
        ...(dto.estimatedMinutes !== undefined
          ? { estimatedMinutes: dto.estimatedMinutes }
          : {}),
        ...(dto.recurrenceRule !== undefined
          ? { recurrenceRule: dto.recurrenceRule }
          : {}),
        ...(dto.recurrenceEndDate !== undefined
          ? { recurrenceEndDate: new Date(dto.recurrenceEndDate) }
          : {}),
        ...(dto.ownerType !== undefined
          ? dto.ownerType === "client"
            ? { clientId: dto.clientId ?? null, projectId: null }
            : { projectId: dto.projectId ?? null, clientId: null }
          : dto.projectId !== undefined
            ? { projectId: dto.projectId, clientId: null }
            : dto.clientId !== undefined
              ? { clientId: dto.clientId, projectId: null }
              : {}),
        ...(dto.boardId !== undefined ? { boardId: dto.boardId } : {}),
        ...(dto.scriptId !== undefined ? { scriptId: dto.scriptId } : {}),
        ...(dto.shootDayEventId !== undefined
          ? { shootDayEventId: dto.shootDayEventId }
          : {}),
        ...(dto.equipment !== undefined ? { equipment: dto.equipment } : {}),
        ...(dto.location !== undefined ? { location: dto.location } : {}),
        ...(dto.callTime !== undefined ? { callTime: dto.callTime } : {}),
        ...(dto.deliverables !== undefined
          ? { deliverables: dto.deliverables }
          : {}),
        ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
        ...(dto.progress !== undefined ? { progress: dto.progress } : {})
      },
      include: taskInclude
    });

    if (dto.status === "completed" && updated.recurrenceRule) {
      await this.createNextRecurrence(updated);
    }

    return toTaskDto(updated);
  }

  async duplicateTask(userId: string, taskId: string) {
    const task = await this.findTaskOrThrow(taskId);
    await organizationsService.requireMembership(task.organizationId, userId);
    const copy = await this.cloneTask(userId, task, {
      title: `${task.title} (copy)`,
      isTemplate: false
    });
    return toTaskDto(copy);
  }

  async listTemplates(userId: string, organizationId: string) {
    await organizationsService.requireMembership(organizationId, userId);
    const templates = await this.prisma.task.findMany({
      where: { organizationId, isTemplate: true },
      include: taskInclude,
      orderBy: { createdAt: "desc" }
    });
    return templates.map(toTaskDto);
  }

  async saveAsTemplate(userId: string, taskId: string) {
    const task = await this.findTaskOrThrow(taskId);
    await organizationsService.requireMembership(task.organizationId, userId);
    const template = await this.cloneTask(userId, task, {
      title: task.title,
      isTemplate: true
    });
    return toTaskDto(template);
  }

  async createFromTemplate(userId: string, templateId: string) {
    const template = await this.findTaskOrThrow(templateId);
    await organizationsService.requireMembership(
      template.organizationId,
      userId
    );
    const task = await this.cloneTask(userId, template, {
      title: template.title,
      isTemplate: false
    });
    await this.logActivity(task.id, userId, "created");
    return toTaskDto(task);
  }

  private async cloneTask(
    userId: string,
    task: TaskWithRelations,
    options: { title: string; isTemplate: boolean }
  ) {
    return this.prisma.task.create({
      data: {
        organizationId: task.organizationId,
        createdById: userId,
        title: options.title,
        description: task.description,
        type: task.type,
        status: "todo",
        priority: task.priority,
        isTemplate: options.isTemplate,
        projectId: task.projectId,
        boardId: task.boardId,
        scriptId: task.scriptId,
        shootDayEventId: task.shootDayEventId,
        equipment: task.equipment,
        location: task.location,
        callTime: task.callTime,
        deliverables: task.deliverables,
        tags: task.tags,
        assignees: {
          create: task.assignees.map((a) => ({
            userId: a.userId,
            responsibility: a.responsibility
          }))
        },
        checklistItems: {
          create: task.checklistItems.map((i) => ({
            text: i.text,
            order: i.order
          }))
        }
      },
      include: taskInclude
    });
  }

  async remove(userId: string, taskId: string): Promise<void> {
    const task = await this.findTaskOrThrow(taskId);
    await organizationsService.requireMembership(task.organizationId, userId);

    await this.prisma.task.delete({ where: { id: taskId } });
  }

  async getTasksForOrganization(organizationId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { organizationId, isTemplate: false },
      include: taskInclude,
      orderBy: { createdAt: "desc" }
    });

    return tasks.map(toTaskDto);
  }

  async addChecklistItem(
    userId: string,
    taskId: string,
    dto: AddChecklistItemDto
  ) {
    const task = await this.findTaskOrThrow(taskId);
    await organizationsService.requireMembership(task.organizationId, userId);

    const count = await this.prisma.taskChecklistItem.count({
      where: { taskId }
    });
    const item = await this.prisma.taskChecklistItem.create({
      data: { taskId, text: dto.text.trim(), order: count }
    });

    return toChecklistItemDto(item);
  }

  async updateChecklistItem(
    userId: string,
    taskId: string,
    itemId: string,
    dto: UpdateChecklistItemDto
  ) {
    const task = await this.findTaskOrThrow(taskId);
    await organizationsService.requireMembership(task.organizationId, userId);

    const item = await this.prisma.taskChecklistItem.update({
      where: { id: itemId },
      data: {
        ...(dto.text !== undefined ? { text: dto.text.trim() } : {}),
        ...(dto.done !== undefined ? { done: dto.done } : {}),
        ...(dto.order !== undefined ? { order: dto.order } : {})
      }
    });

    await this.recomputeProgress(taskId);
    return toChecklistItemDto(item);
  }

  async removeChecklistItem(
    userId: string,
    taskId: string,
    itemId: string
  ): Promise<void> {
    const task = await this.findTaskOrThrow(taskId);
    await organizationsService.requireMembership(task.organizationId, userId);

    await this.prisma.taskChecklistItem.delete({ where: { id: itemId } });
    await this.recomputeProgress(taskId);
  }

  async addDependency(userId: string, taskId: string, dto: AddDependencyDto) {
    const task = await this.findTaskOrThrow(taskId);
    await organizationsService.requireMembership(task.organizationId, userId);

    if (dto.blockingTaskId === taskId) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "A task cannot block itself."
      );
    }
    const blocker = await this.findTaskOrThrow(dto.blockingTaskId);
    if (blocker.organizationId !== task.organizationId) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "blockingTaskId must belong to the same house."
      );
    }

    await this.prisma.taskDependency.create({
      data: { blockingTaskId: dto.blockingTaskId, blockedTaskId: taskId }
    });
    await this.logActivity(
      taskId,
      userId,
      "dependency_added",
      null,
      blocker.title
    );

    return this.getTask(userId, taskId);
  }

  async removeDependency(
    userId: string,
    taskId: string,
    blockingTaskId: string
  ) {
    const task = await this.findTaskOrThrow(taskId);
    await organizationsService.requireMembership(task.organizationId, userId);

    await this.prisma.taskDependency.deleteMany({
      where: { blockedTaskId: taskId, blockingTaskId }
    });

    return this.getTask(userId, taskId);
  }

  async startTimer(userId: string, taskId: string) {
    const task = await this.findTaskOrThrow(taskId);
    await organizationsService.requireMembership(task.organizationId, userId);

    const running = await this.prisma.taskTimeEntry.findFirst({
      where: { taskId, userId, endedAt: null }
    });
    if (running) {
      throw new AppException(
        HttpStatus.CONFLICT,
        "timer_already_running",
        "You already have a running timer on this task."
      );
    }

    const entry = await this.prisma.taskTimeEntry.create({
      data: { taskId, userId, startedAt: new Date() }
    });
    return toTimeEntryDto(entry);
  }

  async stopTimer(userId: string, taskId: string, dto: StopTimerDto) {
    const task = await this.findTaskOrThrow(taskId);
    await organizationsService.requireMembership(task.organizationId, userId);

    const running = await this.prisma.taskTimeEntry.findFirst({
      where: { taskId, userId, endedAt: null },
      orderBy: { startedAt: "desc" }
    });
    if (!running) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "no_running_timer",
        "No running timer to stop."
      );
    }

    const endedAt = new Date();
    const durationMinutes = Math.max(
      1,
      Math.round((endedAt.getTime() - running.startedAt.getTime()) / 60000)
    );
    const entry = await this.prisma.taskTimeEntry.update({
      where: { id: running.id },
      data: { endedAt, durationMinutes, note: dto.note?.trim() || null }
    });

    return toTimeEntryDto(entry);
  }

  async addWorkLogEntry(userId: string, taskId: string, dto: AddWorkLogDto) {
    const task = await this.findTaskOrThrow(taskId);
    await organizationsService.requireMembership(task.organizationId, userId);

    const entry = await this.prisma.taskTimeEntry.create({
      data: {
        taskId,
        userId,
        startedAt: new Date(dto.startedAt),
        endedAt: new Date(dto.endedAt),
        durationMinutes: dto.durationMinutes,
        note: dto.note?.trim() || null
      }
    });

    return toTimeEntryDto(entry);
  }

  async listTimeEntries(userId: string, taskId: string) {
    const task = await this.findTaskOrThrow(taskId);
    await organizationsService.requireMembership(task.organizationId, userId);

    const entries = await this.prisma.taskTimeEntry.findMany({
      where: { taskId },
      include: { user: true },
      orderBy: { startedAt: "desc" }
    });

    return entries.map((entry) => toTimeEntryDto(entry, entry.user.name));
  }

  async listActivity(userId: string, taskId: string) {
    const task = await this.findTaskOrThrow(taskId);
    await organizationsService.requireMembership(task.organizationId, userId);

    const activity = await this.prisma.taskActivity.findMany({
      where: { taskId },
      include: { actor: true },
      orderBy: { createdAt: "asc" }
    });

    return activity.map(toActivityDto);
  }

  private async createNextRecurrence(task: TaskWithRelations): Promise<void> {
    if (!task.dueDate || !task.recurrenceRule) {
      return;
    }

    const next = new Date(task.dueDate);
    if (task.recurrenceRule === "daily") {
      next.setDate(next.getDate() + 1);
    } else if (task.recurrenceRule === "weekly") {
      next.setDate(next.getDate() + 7);
    } else if (task.recurrenceRule === "monthly") {
      next.setMonth(next.getMonth() + 1);
    } else {
      return;
    }

    if (task.recurrenceEndDate && next > task.recurrenceEndDate) {
      return;
    }

    await this.prisma.task.create({
      data: {
        organizationId: task.organizationId,
        createdById: task.createdById,
        title: task.title,
        description: task.description,
        type: task.type,
        status: "todo",
        priority: task.priority,
        dueDate: next,
        estimatedMinutes: task.estimatedMinutes,
        recurrenceRule: task.recurrenceRule,
        recurrenceEndDate: task.recurrenceEndDate,
        projectId: task.projectId,
        boardId: task.boardId,
        scriptId: task.scriptId,
        equipment: task.equipment,
        location: task.location,
        callTime: task.callTime,
        deliverables: task.deliverables,
        tags: task.tags,
        assignees: {
          create: task.assignees.map((a) => ({
            userId: a.userId,
            responsibility: a.responsibility
          }))
        }
      }
    });
  }

  private async logActivity(
    taskId: string,
    actorId: string,
    type: string,
    fromValue: string | null = null,
    toValue: string | null = null
  ): Promise<void> {
    await this.prisma.taskActivity.create({
      data: { taskId, actorId, type, fromValue, toValue }
    });
  }

  private async recomputeProgress(taskId: string): Promise<void> {
    const items = await this.prisma.taskChecklistItem.findMany({
      where: { taskId }
    });
    if (items.length === 0) {
      return;
    }
    const progress = Math.round(
      (items.filter((i) => i.done).length / items.length) * 100
    );
    await this.prisma.task.update({
      where: { id: taskId },
      data: { progress }
    });
  }

  private async requireMembers(
    organizationId: string,
    userIds: string[]
  ): Promise<void> {
    const memberships = await this.prisma.organizationMembership.findMany({
      where: { organizationId, userId: { in: userIds } },
      select: { userId: true }
    });
    if (memberships.length !== new Set(userIds).size) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "All assignees must be members of this house."
      );
    }
  }

  private async requireProjectInHouse(
    organizationId: string,
    projectId: string
  ): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    });
    if (!project || project.organizationId !== organizationId) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "projectId must belong to this house."
      );
    }
  }

  private async requireClientInHouse(
    organizationId: string,
    clientId: string
  ): Promise<void> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId }
    });
    if (!client || client.organizationId !== organizationId) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "clientId must belong to this house."
      );
    }
  }

  private async requireTaskInHouse(
    organizationId: string,
    taskId: string
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.organizationId !== organizationId) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "parentTaskId must belong to this house."
      );
    }
  }

  private async findTaskOrThrow(taskId: string): Promise<TaskWithRelations> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: taskInclude
    });
    if (!task) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "task_not_found",
        "This task does not exist."
      );
    }
    return task;
  }
}

export const tasksService = new TasksService();

function toChecklistItemDto(item: {
  id: string;
  text: string;
  done: boolean;
  order: number;
}) {
  return { id: item.id, text: item.text, done: item.done, order: item.order };
}

function toTimeEntryDto(
  entry: {
    id: string;
    userId: string;
    startedAt: Date;
    endedAt: Date | null;
    durationMinutes: number | null;
    note: string | null;
  },
  userName?: string
) {
  return {
    id: entry.id,
    userId: entry.userId,
    userName: userName ?? null,
    startedAt: entry.startedAt.toISOString(),
    endedAt: entry.endedAt?.toISOString() ?? null,
    durationMinutes: entry.durationMinutes,
    note: entry.note
  };
}

function toActivityDto(activity: {
  id: string;
  type: string;
  fromValue: string | null;
  toValue: string | null;
  actorId: string;
  actor: { name: string };
  createdAt: Date;
}) {
  return {
    id: activity.id,
    type: activity.type,
    fromValue: activity.fromValue,
    toValue: activity.toValue,
    actorId: activity.actorId,
    actorName: activity.actor.name,
    createdAt: activity.createdAt.toISOString()
  };
}

function toTaskDto(task: TaskWithRelations) {
  const owner = toOwnerDto(task);
  const notCompleted = (status: string) =>
    status !== "completed" && status !== "archived";

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    type: task.type,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.toISOString() ?? null,
    startDate: task.startDate?.toISOString() ?? null,
    estimatedMinutes: task.estimatedMinutes,
    recurrenceRule: task.recurrenceRule,
    recurrenceEndDate: task.recurrenceEndDate?.toISOString() ?? null,
    equipment: task.equipment,
    location: task.location,
    callTime: task.callTime,
    deliverables: task.deliverables,
    tags: task.tags,
    progress: task.progress,
    createdById: task.createdById,
    createdByName: task.createdBy.name,
    createdByAvatarUrl: task.createdBy.avatarUrl,
    ownerType: owner?.ownerType ?? null,
    ownerId: owner?.ownerId ?? null,
    ownerName: owner?.ownerName ?? null,
    projectId: task.projectId,
    projectTitle: task.project?.name ?? null,
    clientId: task.clientId,
    clientName: task.client?.name ?? null,
    boardId: task.boardId,
    boardName: task.board?.name ?? null,
    scriptId: task.scriptId,
    scriptTitle: task.script?.title ?? null,
    shootDayEventId: task.shootDayEventId,
    shootDayEventTitle: task.shootDayEvent?.title ?? null,
    shootId: task.shootId,
    parentTaskId: task.parentTaskId,
    assignees: task.assignees.map((a) => ({
      userId: a.userId,
      name: a.user.name,
      avatarUrl: a.user.avatarUrl,
      responsibility: a.responsibility
    })),
    checklistItems: task.checklistItems.map(toChecklistItemDto),
    subtasks: task.subtasks.map((s) => ({
      id: s.id,
      title: s.title,
      status: s.status
    })),
    blockedByTasks: task.blockedBy.map((d) => ({
      id: d.blockingTask.id,
      title: d.blockingTask.title,
      status: d.blockingTask.status
    })),
    blockingTasks: task.blockingOf.map((d) => ({
      id: d.blockedTask.id,
      title: d.blockedTask.title,
      status: d.blockedTask.status
    })),
    isBlocked: task.blockedBy.some((d) => notCompleted(d.blockingTask.status)),
    attachmentIds: task.attachments.map((a) => a.id),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  };
}
