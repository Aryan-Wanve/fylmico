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
        contactName: dto.contactName?.trim() || null,
        contactEmail: dto.contactEmail?.trim() || null
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
      where: { organizationId: houseId },
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
        ...(dto.contactName !== undefined
          ? { contactName: dto.contactName.trim() || null }
          : {}),
        ...(dto.contactEmail !== undefined
          ? { contactEmail: dto.contactEmail.trim() || null }
          : {})
      }
    });

    return toClientDto(updated);
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
    contactName: client.contactName,
    contactEmail: client.contactEmail,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt
  };
}
