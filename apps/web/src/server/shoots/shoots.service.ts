import type { Prisma } from "@fylmico/database";
import { driveStructureService } from "../drive/drive-structure.service";
import { AppException, HttpStatus } from "../http";
import { notificationsService } from "../notifications/notifications.service";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";
import type { CancelShootDto } from "./dto/cancel-shoot.dto";
import type { CreateShootDto } from "./dto/create-shoot.dto";

const shootInclude = {
  tasks: { include: { assignees: { include: { user: true } } } }
} satisfies Prisma.ShootInclude;

type ShootWithRelations = Prisma.ShootGetPayload<{
  include: typeof shootInclude;
}>;

class ShootsService {
  private readonly prisma = prisma;

  async create(
    userId: string,
    houseId: string,
    projectId: string,
    dto: CreateShootDto
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    });
    if (!project || project.organizationId !== houseId) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "project_not_found",
        "This project does not exist."
      );
    }
    await organizationsService.requireMembership(houseId, userId);

    const crewIds = dto.crewIds ?? [];
    if (crewIds.length) {
      await this.requireHouseMembers(houseId, crewIds);
    }

    const name = dto.name.trim();

    const created = await this.prisma.$transaction(async (tx) => {
      const calendarEvent = await tx.calendarEvent.create({
        data: {
          organizationId: houseId,
          projectId,
          createdById: userId,
          title: name,
          date: dto.scheduledDate,
          time: dto.callTime ?? "",
          location: dto.location ?? null,
          category: "shoot"
        }
      });

      const shoot = await tx.shoot.create({
        data: {
          organizationId: houseId,
          projectId,
          calendarEventId: calendarEvent.id,
          createdById: userId,
          name,
          scheduledDate: dto.scheduledDate,
          callTime: dto.callTime ?? null,
          location: dto.location ?? null,
          equipment: dto.equipment ?? [],
          notes: dto.notes?.trim() || null
        }
      });

      await tx.task.create({
        data: {
          organizationId: houseId,
          createdById: userId,
          projectId,
          shootId: shoot.id,
          shootDayEventId: calendarEvent.id,
          title: name,
          type: "shoot",
          dueDate: new Date(dto.scheduledDate),
          equipment: dto.equipment ?? [],
          location: dto.location ?? null,
          callTime: dto.callTime ?? null,
          assignees: crewIds.length
            ? { create: crewIds.map((crewId) => ({ userId: crewId })) }
            : undefined
        }
      });

      return shoot;
    });

    for (const crewId of crewIds) {
      if (crewId !== userId) {
        await notificationsService.create(
          crewId,
          "task_assigned",
          `New shoot: ${name}`,
          `You were assigned to the shoot "${name}" on ${dto.scheduledDate}.`,
          houseId
        );
      }
    }

    return toShootDto(await this.findShootOrThrow(created.id));
  }

  async listForProject(userId: string, projectId: string) {
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
    await organizationsService.requireMembership(
      project.organizationId,
      userId
    );

    const shoots = await this.prisma.shoot.findMany({
      where: { projectId },
      include: shootInclude,
      orderBy: { scheduledDate: "asc" }
    });

    return shoots.map(toShootDto);
  }

  async get(userId: string, shootId: string) {
    const shoot = await this.findShootOrThrow(shootId);
    await organizationsService.requireMembership(shoot.organizationId, userId);
    return toShootDto(shoot);
  }

  async markReached(userId: string, shootId: string) {
    return this.transition(userId, shootId, {
      status: "crew-reached",
      reachedAt: new Date()
    });
  }

  async start(userId: string, shootId: string) {
    return this.transition(userId, shootId, {
      status: "started",
      startedAt: new Date()
    });
  }

  async finish(userId: string, shootId: string) {
    return this.transition(userId, shootId, {
      status: "finished",
      finishedAt: new Date()
    });
  }

  async finishAndUpload(userId: string, shootId: string) {
    return this.transition(userId, shootId, {
      status: "uploading",
      finishedAt: new Date()
    });
  }

  async getUploadFolder(userId: string, shootId: string) {
    const shoot = await this.findShootOrThrow(shootId);
    await organizationsService.requireMembership(shoot.organizationId, userId);

    const folder = await driveStructureService.ensureShootFolder(
      shoot.organizationId,
      shoot.projectId,
      shoot.id,
      shoot.name,
      shoot.scheduledDate.slice(0, 10)
    );
    return { parentId: folder.id };
  }

  async markUploaded(userId: string, shootId: string) {
    const shootBefore = await this.findShootOrThrow(shootId);
    const updated = await this.transition(userId, shootId, {
      status: "uploaded",
      uploadedAt: new Date()
    });

    try {
      await this.createEditingTask(userId, shootId);
    } catch (error) {
      // Best-effort, same as every other Drive-dependent side effect in
      // this codebase (see ensureProjectFolder/ensureClientFolder calls) -
      // the shoot's own status transition above already succeeded, so a
      // Drive hiccup here shouldn't fail the whole request.
      console.error(
        "[shoots] could not auto-create editing task for shoot",
        error
      );
    }

    if (shootBefore.createdById !== userId) {
      await notificationsService.create(
        shootBefore.createdById,
        "shoot_uploaded",
        `Footage uploaded: ${shootBefore.name}`,
        `Footage for "${shootBefore.name}" was uploaded and an editing task was created.`,
        shootBefore.organizationId
      );
    }

    return updated;
  }

  private async createEditingTask(
    userId: string,
    shootId: string
  ): Promise<void> {
    const shoot = await this.findShootOrThrow(shootId);

    const editingTask = await this.prisma.task.create({
      data: {
        organizationId: shoot.organizationId,
        createdById: userId,
        projectId: shoot.projectId,
        title: `Edit ${shoot.name}`,
        type: "edit"
      }
    });

    const folder = await driveStructureService.ensureShootFolder(
      shoot.organizationId,
      shoot.projectId,
      shoot.id,
      shoot.name,
      shoot.scheduledDate.slice(0, 10)
    );
    await this.prisma.fileEntry.update({
      where: { id: folder.id },
      data: { taskId: editingTask.id }
    });

    const assets = await this.prisma.fileEntry.findUnique({
      where: {
        organizationId_driveKey: {
          organizationId: shoot.organizationId,
          driveKey: `project:${shoot.projectId}:Assets`
        }
      }
    });
    if (assets) {
      await this.prisma.fileEntry.update({
        where: { id: assets.id },
        data: { taskId: editingTask.id }
      });
    }
  }

  async markReadyForEditing(userId: string, shootId: string) {
    const shootBefore = await this.findShootOrThrow(shootId);
    const updated = await this.transition(userId, shootId, {
      status: "ready-for-editing"
    });

    if (shootBefore.createdById !== userId) {
      await notificationsService.create(
        shootBefore.createdById,
        "shoot_ready_for_editing",
        `Ready for editing: ${shootBefore.name}`,
        `"${shootBefore.name}" is ready for editing.`,
        shootBefore.organizationId
      );
    }

    return updated;
  }

  async archive(userId: string, shootId: string) {
    return this.transition(userId, shootId, { status: "archived" });
  }

  async cancel(userId: string, shootId: string, dto: CancelShootDto) {
    const shootBefore = await this.findShootOrThrow(shootId);
    const updated = await this.transition(userId, shootId, {
      status: "cancelled",
      cancelReason: dto.reason.trim(),
      cancelNotes: dto.notes?.trim() || null,
      cancelledAt: new Date()
    });

    const crewIds = new Set(
      shootBefore.tasks.flatMap((task) =>
        task.assignees.map((assignee) => assignee.userId)
      )
    );
    if (shootBefore.createdById !== userId) {
      crewIds.add(shootBefore.createdById);
    }
    for (const crewId of crewIds) {
      if (crewId !== userId) {
        await notificationsService.create(
          crewId,
          "shoot_cancelled",
          `Shoot cancelled: ${shootBefore.name}`,
          `"${shootBefore.name}" was cancelled: ${dto.reason.trim()}`,
          shootBefore.organizationId
        );
      }
    }

    return updated;
  }

  private async transition(
    userId: string,
    shootId: string,
    data: Prisma.ShootUpdateInput
  ) {
    const shoot = await this.findShootOrThrow(shootId);
    await organizationsService.requireMembership(shoot.organizationId, userId);

    const updated = await this.prisma.shoot.update({
      where: { id: shootId },
      data,
      include: shootInclude
    });

    return toShootDto(updated);
  }

  private async requireHouseMembers(
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
        "crewIds must all belong to this house."
      );
    }
  }

  private async findShootOrThrow(shootId: string): Promise<ShootWithRelations> {
    const shoot = await this.prisma.shoot.findUnique({
      where: { id: shootId },
      include: shootInclude
    });
    if (!shoot) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "shoot_not_found",
        "This shoot does not exist."
      );
    }
    return shoot;
  }
}

export const shootsService = new ShootsService();

function toShootDto(shoot: ShootWithRelations) {
  const task = shoot.tasks[0];

  return {
    id: shoot.id,
    projectId: shoot.projectId,
    taskId: task?.id ?? null,
    name: shoot.name,
    scheduledDate: shoot.scheduledDate,
    callTime: shoot.callTime,
    location: shoot.location,
    equipment: shoot.equipment,
    notes: shoot.notes,
    status: shoot.status,
    cancelReason: shoot.cancelReason,
    cancelNotes: shoot.cancelNotes,
    reachedAt: shoot.reachedAt?.toISOString() ?? null,
    startedAt: shoot.startedAt?.toISOString() ?? null,
    finishedAt: shoot.finishedAt?.toISOString() ?? null,
    uploadedAt: shoot.uploadedAt?.toISOString() ?? null,
    cancelledAt: shoot.cancelledAt?.toISOString() ?? null,
    crew: (task?.assignees ?? []).map((assignee) => ({
      userId: assignee.userId,
      name: assignee.user.name
    })),
    createdAt: shoot.createdAt.toISOString(),
    updatedAt: shoot.updatedAt.toISOString()
  };
}
