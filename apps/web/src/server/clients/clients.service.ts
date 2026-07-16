import type { Client } from "@fylmico/database";
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
import type { CreateClientDto } from "./dto/create-client.dto";
import type { UpdateClientDto } from "./dto/update-client.dto";

class ClientsService {
  private readonly prisma = prisma;

  async create(userId: string, houseId: string, dto: CreateClientDto) {
    await organizationsService.requireMembership(houseId, userId);

    const client = await this.prisma.client.create({
      data: {
        organizationId: houseId,
        name: dto.name.trim(),
        logoUrl: dto.logoUrl?.trim() || null,
        contactName: dto.contactName?.trim() || null,
        contactEmail: dto.contactEmail?.trim() || null,
        phone: dto.phone?.trim() || null,
        address: dto.address?.trim() || null,
        gst: dto.gst?.trim() || null,
        notes: dto.notes?.trim() || null
      }
    });

    try {
      await driveStructureService.ensureClientFolder(
        houseId,
        client.id,
        client.name
      );
    } catch (error) {
      console.error(
        "[clients] could not create Drive folder for client",
        error
      );
    }

    return toClientDto(client);
  }

  async list(
    userId: string,
    houseId: string,
    pagination: CursorPaginationDto
  ): Promise<Page<ReturnType<typeof toClientDto>>> {
    await organizationsService.requireMembership(houseId, userId);

    const limit = resolveLimit(pagination);
    const clients = await this.prisma.client.findMany({
      where: { organizationId: houseId, status: { not: "archived" } },
      orderBy: { createdAt: "asc" },
      take: limit + 1,
      ...(pagination.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {})
    });

    const page = buildPage(clients, limit, pagination.cursor);
    return { ...page, data: page.data.map(toClientDto) };
  }

  async get(userId: string, clientId: string) {
    const client = await this.findClientOrThrow(clientId);
    await organizationsService.requireMembership(client.organizationId, userId);
    return toClientDto(client);
  }

  async update(userId: string, clientId: string, dto: UpdateClientDto) {
    const client = await this.findClientOrThrow(clientId);
    await organizationsService.requireMembership(client.organizationId, userId);

    const updated = await this.prisma.client.update({
      where: { id: clientId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.logoUrl !== undefined
          ? { logoUrl: dto.logoUrl.trim() || null }
          : {}),
        ...(dto.contactName !== undefined
          ? { contactName: dto.contactName.trim() || null }
          : {}),
        ...(dto.contactEmail !== undefined
          ? { contactEmail: dto.contactEmail.trim() || null }
          : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone.trim() || null } : {}),
        ...(dto.address !== undefined
          ? { address: dto.address.trim() || null }
          : {}),
        ...(dto.gst !== undefined ? { gst: dto.gst.trim() || null } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes.trim() || null } : {})
      }
    });

    return toClientDto(updated);
  }

  async archive(userId: string, clientId: string) {
    const client = await this.findClientOrThrow(clientId);
    await organizationsService.requireMembership(client.organizationId, userId);

    const archived = await this.prisma.client.update({
      where: { id: clientId },
      data: { status: "archived" }
    });

    return toClientDto(archived);
  }

  async delete(userId: string, clientId: string) {
    const client = await this.findClientOrThrow(clientId);
    await organizationsService.requireMembership(client.organizationId, userId);

    const projectCount = await this.prisma.projectClient.count({
      where: { clientId }
    });
    if (projectCount > 0) {
      throw new AppException(
        HttpStatus.CONFLICT,
        "client_has_projects",
        "Archive or unlink this client's projects before deleting it."
      );
    }

    await this.prisma.client.delete({ where: { id: clientId } });
    return { success: true };
  }

  async getClientStats(userId: string, clientId: string) {
    const client = await this.findClientOrThrow(clientId);
    await organizationsService.requireMembership(client.organizationId, userId);

    const links = await this.prisma.projectClient.findMany({
      where: { clientId },
      include: { project: { select: { status: true, stage: true } } }
    });
    const projects = links.map((link) => link.project);
    const activeProjects = projects.filter(
      (project) =>
        project.status !== "archived" && project.stage !== "Completed"
    ).length;
    const completedProjects = projects.filter(
      (project) => project.stage === "Completed"
    ).length;

    const driveKeyPrefixes = [
      `client:${clientId}`,
      ...links.map((l) => `project:${l.projectId}`)
    ];
    const folders = await this.prisma.fileEntry.findMany({
      where: {
        organizationId: client.organizationId,
        OR: driveKeyPrefixes.map((prefix) => ({
          driveKey: { startsWith: prefix }
        }))
      },
      select: { id: true }
    });
    const storage = await this.prisma.fileEntry.aggregate({
      where: { parentId: { in: folders.map((folder) => folder.id) } },
      _sum: { size: true }
    });

    return {
      activeProjects,
      completedProjects,
      totalShoots: 0,
      videosDelivered: 0,
      storageBytes: storage._sum.size ?? 0
    };
  }

  private async findClientOrThrow(clientId: string): Promise<Client> {
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
}

export const clientsService = new ClientsService();

function toClientDto(client: Client) {
  return {
    id: client.id,
    name: client.name,
    logoUrl: client.logoUrl,
    contactName: client.contactName,
    contactEmail: client.contactEmail,
    phone: client.phone,
    address: client.address,
    gst: client.gst,
    notes: client.notes,
    status: client.status,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt
  };
}
