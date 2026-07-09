import { HttpStatus, Injectable } from "@nestjs/common";
import { Prisma, PrismaService } from "@fylmico/database";
import {
  buildPage,
  resolveLimit,
  type CursorPaginationDto,
  type Page
} from "../common/pagination";
import { AppException } from "../common/exceptions/app.exception";
import { OrganizationsService } from "../organizations/organizations.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { LinkClientDto } from "./dto/link-client.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

const projectInclude = {
  clients: { include: { client: true } }
} satisfies Prisma.ProjectInclude;

type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: typeof projectInclude;
}>;

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationsService: OrganizationsService
  ) {}

  async create(userId: string, houseId: string, dto: CreateProjectDto) {
    await this.organizationsService.requireMembership(houseId, userId);

    const project = await this.prisma.project.create({
      data: {
        organizationId: houseId,
        name: dto.name.trim(),
        description: dto.description?.trim() || null
      },
      include: projectInclude
    });

    return toProjectDto(project);
  }

  async list(
    userId: string,
    houseId: string,
    pagination: CursorPaginationDto
  ): Promise<Page<ReturnType<typeof toProjectDto>>> {
    await this.organizationsService.requireMembership(houseId, userId);

    const limit = resolveLimit(pagination);
    const projects = await this.prisma.project.findMany({
      where: { organizationId: houseId },
      include: projectInclude,
      orderBy: { createdAt: "asc" },
      take: limit + 1,
      ...(pagination.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {})
    });

    const page = buildPage(projects, limit, pagination.cursor);
    return { ...page, data: page.data.map(toProjectDto) };
  }

  async get(userId: string, projectId: string) {
    const project = await this.findProjectOrThrow(projectId);
    await this.organizationsService.requireMembership(
      project.organizationId,
      userId
    );
    return toProjectDto(project);
  }

  async update(userId: string, projectId: string, dto: UpdateProjectDto) {
    const project = await this.findProjectOrThrow(projectId);
    await this.organizationsService.requireMembership(
      project.organizationId,
      userId
    );

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() || null }
          : {})
      },
      include: projectInclude
    });

    return toProjectDto(updated);
  }

  async archive(userId: string, projectId: string) {
    const project = await this.findProjectOrThrow(projectId);
    await this.organizationsService.requireMembership(
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
    await this.organizationsService.requireMembership(
      project.organizationId,
      userId
    );

    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId }
    });
    if (!client || client.organizationId !== project.organizationId) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "clientId must belong to the same house as the project."
      );
    }

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

    await this.prisma.projectClient.create({
      data: { projectId, clientId: dto.clientId }
    });

    const updated = await this.prisma.project.findUniqueOrThrow({
      where: { id: projectId },
      include: projectInclude
    });
    return toProjectDto(updated);
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

function toProjectDto(project: ProjectWithRelations) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    clients: project.clients.map((link) => ({
      id: link.client.id,
      name: link.client.name
    }))
  };
}
