import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService, type Client } from "@fylmico/database";
import {
  buildPage,
  resolveLimit,
  type CursorPaginationDto,
  type Page
} from "../common/pagination";
import { AppException } from "../common/exceptions/app.exception";
import { OrganizationsService } from "../organizations/organizations.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationsService: OrganizationsService
  ) {}

  async create(userId: string, houseId: string, dto: CreateClientDto) {
    await this.organizationsService.requireMembership(houseId, userId);

    const client = await this.prisma.client.create({
      data: {
        organizationId: houseId,
        name: dto.name.trim(),
        contactName: dto.contactName?.trim() || null,
        contactEmail: dto.contactEmail?.trim() || null
      }
    });

    return toClientDto(client);
  }

  async list(
    userId: string,
    houseId: string,
    pagination: CursorPaginationDto
  ): Promise<Page<ReturnType<typeof toClientDto>>> {
    await this.organizationsService.requireMembership(houseId, userId);

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
    await this.organizationsService.requireMembership(
      client.organizationId,
      userId
    );
    return toClientDto(client);
  }

  async update(userId: string, clientId: string, dto: UpdateClientDto) {
    const client = await this.findClientOrThrow(clientId);
    await this.organizationsService.requireMembership(
      client.organizationId,
      userId
    );

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
