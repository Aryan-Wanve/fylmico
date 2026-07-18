import type { Prisma } from "@fylmico/database";
import { chatService } from "../chat/chat.service";
import { driveStructureService } from "../drive/drive-structure.service";
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
import {
  PROJECT_STAGES,
  type CreateProjectDto
} from "./dto/create-project.dto";
import type { UpdateProjectDto } from "./dto/update-project.dto";

const projectInclude = {} satisfies Prisma.ProjectInclude;

type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: typeof projectInclude;
}>;

const STAGE_TO_DISPLAY_STATUS: Record<
  (typeof PROJECT_STAGES)[number],
  "active" | "in-progress" | "on-hold" | "completed"
> = {
  Development: "active",
  "Pre-Production": "active",
  "In Production": "active",
  "In Progress": "in-progress",
  "Post-Production": "in-progress",
  "On Hold": "on-hold",
  Completed: "completed"
};

class ProjectsService {
  private readonly prisma = prisma;

  async create(userId: string, houseId: string, dto: CreateProjectDto) {
    await organizationsService.requireMembership(houseId, userId);

    if (dto.teamIds?.length) {
      await this.requireHouseMembers(houseId, dto.teamIds);
    }

    const project = await this.prisma.project.create({
      data: {
        organizationId: houseId,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        type: dto.type,
        genre: dto.genre?.trim() || null,
        ...(dto.stage ? { stage: dto.stage } : {}),
        ...(dto.priority ? { priority: dto.priority } : {}),
        ...(dto.progress !== undefined ? { progress: dto.progress } : {}),
        coverGradient: dto.coverGradient,
        coverIcon: dto.coverIcon,
        dueDate: dto.dueDate,
        teamIds: dto.teamIds ?? []
      },
      include: projectInclude
    });

    try {
      await driveStructureService.ensureOwnerFolder(
        houseId,
        "project",
        project.id,
        project.name
      );
    } catch (error) {
      console.error(
        "[projects] could not create Drive folder for project",
        error
      );
    }

    try {
      await chatService.ensureProjectConversation(
        houseId,
        project.id,
        project.name
      );
    } catch (error) {
      console.error(
        "[projects] could not create project chat conversation",
        error
      );
    }

    await this.notifyTeamAdded(
      userId,
      houseId,
      dto.teamIds ?? [],
      project.name
    );

    return toProjectDto(project);
  }

  async list(
    userId: string,
    houseId: string,
    pagination: CursorPaginationDto
  ): Promise<Page<ReturnType<typeof toProjectDto>>> {
    await organizationsService.requireMembership(houseId, userId);

    const limit = resolveLimit(pagination);
    const projects = await this.prisma.project.findMany({
      where: { organizationId: houseId, status: { not: "archived" } },
      include: projectInclude,
      orderBy: { createdAt: "asc" },
      take: limit + 1,
      ...(pagination.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {})
    });

    const page = buildPage(projects, limit, pagination.cursor);
    const stats = await this.getProjectListStats(
      houseId,
      page.data.map((project) => project.id)
    );

    return {
      ...page,
      data: page.data.map((project) => ({
        ...toProjectDto(project),
        ...(stats.get(project.id) ?? {
          taskCount: 0,
          completedTaskCount: 0,
          storageBytes: 0,
          fileCount: 0
        })
      }))
    };
  }

  private async getProjectListStats(
    organizationId: string,
    projectIds: string[]
  ): Promise<
    Map<
      string,
      {
        taskCount: number;
        completedTaskCount: number;
        storageBytes: number;
        fileCount: number;
      }
    >
  > {
    const result = new Map<
      string,
      {
        taskCount: number;
        completedTaskCount: number;
        storageBytes: number;
        fileCount: number;
      }
    >();
    for (const projectId of projectIds) {
      result.set(projectId, {
        taskCount: 0,
        completedTaskCount: 0,
        storageBytes: 0,
        fileCount: 0
      });
    }
    if (projectIds.length === 0) {
      return result;
    }

    const [taskGroups, folders] = await Promise.all([
      this.prisma.task.groupBy({
        by: ["projectId", "status"],
        where: { projectId: { in: projectIds }, isTemplate: false },
        _count: true
      }),
      this.prisma.fileEntry.findMany({
        where: { organizationId, driveKey: { startsWith: "project:" } },
        select: { id: true, driveKey: true }
      })
    ]);

    for (const group of taskGroups) {
      if (!group.projectId) {
        continue;
      }
      const entry = result.get(group.projectId);
      if (!entry) {
        continue;
      }
      entry.taskCount += group._count;
      if (group.status === "completed") {
        entry.completedTaskCount += group._count;
      }
    }

    const folderToProject = new Map<string, string>();
    for (const folder of folders) {
      const match = folder.driveKey?.match(/^project:([^:]+)/);
      if (match && projectIds.includes(match[1])) {
        folderToProject.set(folder.id, match[1]);
      }
    }

    const folderIds = [...folderToProject.keys()];
    if (folderIds.length > 0) {
      const childFiles = await this.prisma.fileEntry.groupBy({
        by: ["parentId"],
        where: { parentId: { in: folderIds } },
        _sum: { size: true },
        _count: true
      });
      for (const child of childFiles) {
        if (!child.parentId) {
          continue;
        }
        const projectId = folderToProject.get(child.parentId);
        const entry = projectId ? result.get(projectId) : undefined;
        if (!entry) {
          continue;
        }
        entry.storageBytes += child._sum.size ?? 0;
        entry.fileCount += child._count;
      }
    }

    return result;
  }

  async get(userId: string, projectId: string) {
    const project = await this.findProjectOrThrow(projectId);
    await organizationsService.requireMembership(
      project.organizationId,
      userId
    );
    return toProjectDto(project);
  }

  async update(userId: string, projectId: string, dto: UpdateProjectDto) {
    const project = await this.findProjectOrThrow(projectId);
    await organizationsService.requireMembership(
      project.organizationId,
      userId
    );

    if (dto.teamIds?.length) {
      await this.requireHouseMembers(project.organizationId, dto.teamIds);
    }

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() || null }
          : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.genre !== undefined ? { genre: dto.genre.trim() || null } : {}),
        ...(dto.stage !== undefined ? { stage: dto.stage } : {}),
        ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
        ...(dto.progress !== undefined ? { progress: dto.progress } : {}),
        ...(dto.coverGradient !== undefined
          ? { coverGradient: dto.coverGradient }
          : {}),
        ...(dto.coverIcon !== undefined ? { coverIcon: dto.coverIcon } : {}),
        ...(dto.dueDate !== undefined ? { dueDate: dto.dueDate } : {}),
        ...(dto.teamIds !== undefined ? { teamIds: dto.teamIds } : {})
      },
      include: projectInclude
    });

    if (dto.teamIds !== undefined) {
      const previousIds = new Set(project.teamIds);
      const newlyAdded = dto.teamIds.filter((id) => !previousIds.has(id));
      await this.notifyTeamAdded(
        userId,
        project.organizationId,
        newlyAdded,
        updated.name
      );
    }

    return toProjectDto(updated);
  }

  private async notifyTeamAdded(
    actorUserId: string,
    houseId: string,
    teamIds: string[],
    projectName: string
  ): Promise<void> {
    for (const memberId of teamIds) {
      if (memberId === actorUserId) continue;
      await notificationsService.create(
        memberId,
        "project_team_added",
        `Added to project: ${projectName}`,
        `You were added to the team for "${projectName}".`,
        houseId
      );
    }
  }

  async archive(userId: string, projectId: string) {
    const project = await this.findProjectOrThrow(projectId);
    await organizationsService.requireMembership(
      project.organizationId,
      userId
    );

    const archived = await this.prisma.project.update({
      where: { id: projectId },
      data: { status: "archived" },
      include: projectInclude
    });

    return toProjectDto(archived);
  }

  async getProjectStats(userId: string, projectId: string) {
    const project = await this.findProjectOrThrow(projectId);
    await organizationsService.requireMembership(
      project.organizationId,
      userId
    );

    const [tasks, timeEntries, folders] = await Promise.all([
      this.prisma.task.findMany({
        where: { projectId, isTemplate: false },
        select: { status: true, assignees: { select: { userId: true } } }
      }),
      this.prisma.timeEntry.findMany({
        where: { projectId },
        select: { hours: true }
      }),
      this.prisma.fileEntry.findMany({
        where: {
          organizationId: project.organizationId,
          driveKey: { startsWith: `project:${projectId}` }
        },
        select: { id: true }
      })
    ]);

    const teamMemberIds = new Set<string>();
    for (const task of tasks) {
      for (const assignee of task.assignees) {
        teamMemberIds.add(assignee.userId);
      }
    }

    const fileAgg = await this.prisma.fileEntry.aggregate({
      where: { parentId: { in: folders.map((folder) => folder.id) } },
      _sum: { size: true },
      _count: true
    });

    return {
      taskCount: tasks.length,
      completedTaskCount: tasks.filter((task) => task.status === "completed")
        .length,
      teamMemberCount: teamMemberIds.size,
      fileCount: fileAgg._count,
      storageBytes: fileAgg._sum.size ?? 0,
      timeLoggedHours:
        Math.round(
          timeEntries.reduce((sum, entry) => sum + entry.hours, 0) * 10
        ) / 10,
      completionPercent: project.progress
    };
  }

  async getProjectTimeline(userId: string, projectId: string) {
    const project = await this.findProjectOrThrow(projectId);
    await organizationsService.requireMembership(
      project.organizationId,
      userId
    );

    const [tasks, taskActivity, shoots, deliverables] = await Promise.all([
      this.prisma.task.findMany({
        where: { projectId, isTemplate: false },
        select: { id: true, title: true, createdAt: true, createdBy: true }
      }),
      this.prisma.taskActivity.findMany({
        where: { task: { projectId, isTemplate: false } },
        select: {
          id: true,
          type: true,
          fromValue: true,
          toValue: true,
          createdAt: true,
          actor: true,
          task: { select: { title: true } }
        }
      }),
      this.prisma.shoot.findMany({ where: { projectId } }),
      this.prisma.deliverable.findMany({
        where: { projectId },
        include: { createdBy: true }
      })
    ]);

    const entries: {
      id: string;
      actorName: string;
      text: string;
      occurredAt: Date;
    }[] = [
      {
        id: `project-${project.id}`,
        actorName: "",
        text: `Project "${project.name}" was created`,
        occurredAt: project.createdAt
      },
      ...tasks.map((task) => ({
        id: `task-${task.id}`,
        actorName: task.createdBy.name,
        text: `added a new task "${task.title}"`,
        occurredAt: task.createdAt
      })),
      ...taskActivity.map((activity) => ({
        id: `task-activity-${activity.id}`,
        actorName: activity.actor.name,
        text: `changed "${activity.task.title}" ${activity.type}${
          activity.toValue ? ` to ${activity.toValue}` : ""
        }`,
        occurredAt: activity.createdAt
      }))
    ];

    for (const shoot of shoots) {
      entries.push({
        id: `shoot-${shoot.id}-scheduled`,
        actorName: "",
        text: `Shoot "${shoot.name}" was scheduled`,
        occurredAt: shoot.createdAt
      });
      if (shoot.reachedAt) {
        entries.push({
          id: `shoot-${shoot.id}-reached`,
          actorName: "",
          text: `Crew reached the location for "${shoot.name}"`,
          occurredAt: shoot.reachedAt
        });
      }
      if (shoot.startedAt) {
        entries.push({
          id: `shoot-${shoot.id}-started`,
          actorName: "",
          text: `Shoot "${shoot.name}" started`,
          occurredAt: shoot.startedAt
        });
      }
      if (shoot.finishedAt) {
        entries.push({
          id: `shoot-${shoot.id}-finished`,
          actorName: "",
          text: `Shoot "${shoot.name}" finished`,
          occurredAt: shoot.finishedAt
        });
      }
      if (shoot.uploadedAt) {
        entries.push({
          id: `shoot-${shoot.id}-uploaded`,
          actorName: "",
          text: `Footage from "${shoot.name}" was uploaded`,
          occurredAt: shoot.uploadedAt
        });
      }
      if (shoot.cancelledAt) {
        entries.push({
          id: `shoot-${shoot.id}-cancelled`,
          actorName: "",
          text: `Shoot "${shoot.name}" was cancelled`,
          occurredAt: shoot.cancelledAt
        });
      }
    }

    for (const deliverable of deliverables) {
      entries.push({
        id: `deliverable-${deliverable.id}-submitted`,
        actorName: deliverable.createdBy.name,
        text: `submitted deliverable v${deliverable.version}`,
        occurredAt: deliverable.createdAt
      });
      if (
        deliverable.status !== "review" &&
        deliverable.updatedAt.getTime() !== deliverable.createdAt.getTime()
      ) {
        entries.push({
          id: `deliverable-${deliverable.id}-status`,
          actorName: "",
          text: `deliverable v${deliverable.version} is now ${deliverable.status}`,
          occurredAt: deliverable.updatedAt
        });
      }
    }

    return entries
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .map((entry) => ({
        id: entry.id,
        actorName: entry.actorName,
        text: entry.text,
        occurredAt: entry.occurredAt.toISOString()
      }));
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
        "teamIds must all belong to this house."
      );
    }
  }

  private async findProjectOrThrow(
    projectId: string
  ): Promise<ProjectWithRelations> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: projectInclude
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
}

export const projectsService = new ProjectsService();

function toProjectDto(project: ProjectWithRelations) {
  const stage = project.stage as (typeof PROJECT_STAGES)[number];

  return {
    id: project.id,
    title: project.name,
    type: project.type,
    genre: project.genre,
    description: project.description,
    stage,
    status: STAGE_TO_DISPLAY_STATUS[stage] ?? "active",
    priority: project.priority as "low" | "medium" | "high" | "urgent",
    progress: project.progress,
    coverGradient: project.coverGradient,
    coverIcon: project.coverIcon,
    dueDate: project.dueDate,
    teamIds: project.teamIds,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}
