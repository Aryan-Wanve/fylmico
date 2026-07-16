import type { Prisma } from "@fylmico/database";
import { driveStructureService } from "../drive/drive-structure.service";
import { AppException, HttpStatus } from "../http";
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
import type { LinkClientDto } from "./dto/link-client.dto";
import type { UpdateProjectDto } from "./dto/update-project.dto";

const projectInclude = {
  clients: { include: { client: true } }
} satisfies Prisma.ProjectInclude;

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

    if (dto.clientId) {
      await this.requireClientInHouse(houseId, dto.clientId);
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
        teamIds: dto.teamIds ?? [],
        ...(dto.clientId
          ? { clients: { create: { clientId: dto.clientId } } }
          : {})
      },
      include: projectInclude
    });

    try {
      await driveStructureService.ensureProjectFolder(
        houseId,
        project.id,
        project.name,
        dto.clientId ?? null
      );
    } catch (error) {
      console.error(
        "[projects] could not create Drive folder for project",
        error
      );
    }

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

    return toProjectDto(updated);
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

  async linkClient(userId: string, projectId: string, dto: LinkClientDto) {
    const project = await this.findProjectOrThrow(projectId);
    await organizationsService.requireMembership(
      project.organizationId,
      userId
    );

    await this.requireClientInHouse(project.organizationId, dto.clientId);

    const existingLink = await this.prisma.projectClient.findUnique({
      where: { projectId_clientId: { projectId, clientId: dto.clientId } }
    });
    if (existingLink) {
      throw new AppException(
        HttpStatus.CONFLICT,
        "already_linked",
        "This client is already linked to the project."
      );
    }

    const isFirstClient = project.clients.length === 0;

    await this.prisma.projectClient.create({
      data: { projectId, clientId: dto.clientId }
    });

    if (isFirstClient) {
      try {
        await driveStructureService.moveProjectFolderToClient(
          project.organizationId,
          projectId,
          dto.clientId
        );
      } catch (error) {
        console.error(
          "[projects] could not move Drive folder to client",
          error
        );
      }
    }

    const updated = await this.prisma.project.findUniqueOrThrow({
      where: { id: projectId },
      include: projectInclude
    });
    return toProjectDto(updated);
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
        "clientId must belong to the same house as the project."
      );
    }
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
    updatedAt: project.updatedAt,
    clients: project.clients.map((link) => ({
      id: link.client.id,
      name: link.client.name
    }))
  };
}
