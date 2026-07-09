import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService, type Task } from "@fylmico/database";
import { AppException } from "../common/exceptions/app.exception";
import { NotificationsService } from "../notifications/notifications.service";
import { OrganizationsService } from "../organizations/organizations.service";
import { CreateTaskDto } from "./dto/create-task.dto";

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationsService: OrganizationsService,
    private readonly notificationsService: NotificationsService
  ) {}

  async createTask(userId: string, dto: CreateTaskDto) {
    await this.organizationsService.requireMembership(dto.houseId, userId);

    const assigneeMembership =
      await this.prisma.organizationMembership.findUnique({
        where: {
          organizationId_userId: {
            organizationId: dto.houseId,
            userId: dto.assigneeId
          }
        },
        include: { user: true }
      });
    if (!assigneeMembership) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "assignee_not_found",
        "Choose a valid assignee."
      );
    }

    const role = await this.prisma.role.findUnique({
      where: {
        organizationId_name: { organizationId: dto.houseId, name: dto.role }
      }
    });
    if (!role) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "role must be a role supported by this house."
      );
    }

    const task = await this.prisma.task.create({
      data: {
        organizationId: dto.houseId,
        title: dto.title.trim(),
        project: dto.project.trim(),
        assigneeId: dto.assigneeId,
        role: dto.role,
        dueDate: dto.dueDate
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

  async getTasksForOrganization(organizationId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { organizationId },
      include: { assignee: true },
      orderBy: { createdAt: "desc" }
    });

    return tasks.map((task) => toTaskDto(task, task.assignee.name));
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
