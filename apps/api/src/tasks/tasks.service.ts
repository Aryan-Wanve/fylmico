import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService, type Task } from "@fylmico/database";
import { AppException } from "../common/exceptions/app.exception";
import { NotificationsService } from "../notifications/notifications.service";
import { OrganizationsService } from "../organizations/organizations.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationsService: OrganizationsService,
    private readonly notificationsService: NotificationsService
  ) {}

  async createTask(userId: string, dto: CreateTaskDto) {
    await this.organizationsService.requireMembership(dto.houseId, userId);

    const assigneeMembership = await this.findMembershipOrThrow(
      dto.houseId,
      dto.assigneeId
    );

    const task = await this.prisma.task.create({
      data: {
        organizationId: dto.houseId,
        title: dto.title.trim(),
        project: dto.project.trim(),
        assigneeId: dto.assigneeId,
        role: assigneeMembership.role.name,
        dueDate: dto.dueDate,
        ...(dto.priority ? { priority: dto.priority } : {}),
        ...(dto.status ? { status: dto.status } : {})
      }
    });

    if (dto.assigneeId !== userId) {
      await this.notificationsService.create(
        dto.assigneeId,
        "task_assigned",
        `New task: ${task.title}`,
        `You were assigned "${task.title}" on ${task.project}, due ${task.dueDate}.`
      );
    }

    return toTaskDto(task, assigneeMembership.user.name);
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    const task = await this.findTaskOrThrow(taskId);
    await this.organizationsService.requireMembership(
      task.organizationId,
      userId
    );

    let role = task.role;
    if (dto.assigneeId && dto.assigneeId !== task.assigneeId) {
      const assigneeMembership = await this.findMembershipOrThrow(
        task.organizationId,
        dto.assigneeId
      );
      role = assigneeMembership.role.name;

      if (dto.assigneeId !== userId) {
        await this.notificationsService.create(
          dto.assigneeId,
          "task_assigned",
          `New task: ${task.title}`,
          `You were assigned "${task.title}" on ${task.project}, due ${task.dueDate}.`
        );
      }
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.project !== undefined ? { project: dto.project.trim() } : {}),
        ...(dto.assigneeId !== undefined
          ? { assigneeId: dto.assigneeId, role }
          : {}),
        ...(dto.dueDate !== undefined ? { dueDate: dto.dueDate } : {}),
        ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {})
      },
      include: { assignee: true }
    });

    return toTaskDto(updated, updated.assignee.name);
  }

  async remove(userId: string, taskId: string): Promise<void> {
    const task = await this.findTaskOrThrow(taskId);
    await this.organizationsService.requireMembership(
      task.organizationId,
      userId
    );

    await this.prisma.task.delete({ where: { id: taskId } });
  }

  async getTasksForOrganization(organizationId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { organizationId },
      include: { assignee: true },
      orderBy: { createdAt: "desc" }
    });

    return tasks.map((task) => toTaskDto(task, task.assignee.name));
  }

  private async findTaskOrThrow(taskId: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "task_not_found",
        "This task does not exist."
      );
    }
    return task;
  }

  private async findMembershipOrThrow(organizationId: string, userId: string) {
    const membership = await this.prisma.organizationMembership.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
      include: { user: true, role: true }
    });
    if (!membership) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "assignee_not_found",
        "Choose a valid assignee."
      );
    }
    return membership;
  }
}

function toTaskDto(task: Task, assigneeName: string) {
  return {
    id: task.id,
    title: task.title,
    project: task.project,
    assigneeId: task.assigneeId,
    assigneeName,
    role: task.role,
    dueDate: task.dueDate,
    status: task.status,
    priority: task.priority
  };
}
