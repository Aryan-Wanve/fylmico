import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "@fylmico/database";
import { AppException } from "../common/exceptions/app.exception";
import { OrganizationsService } from "../organizations/organizations.service";
import { CreateTimeEntryDto } from "./dto/create-time-entry.dto";

@Injectable()
export class TimeEntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationsService: OrganizationsService
  ) {}

  async list(userId: string, houseId: string) {
    await this.organizationsService.requireMembership(houseId, userId);

    const entries = await this.prisma.timeEntry.findMany({
      where: { organizationId: houseId },
      orderBy: { date: "desc" }
    });

    return entries.map(toTimeEntryDto);
  }

  async create(userId: string, houseId: string, dto: CreateTimeEntryDto) {
    await this.organizationsService.requireMembership(houseId, userId);

    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId }
      });
      if (!project || project.organizationId !== houseId) {
        throw new AppException(
          HttpStatus.NOT_FOUND,
          "project_not_found",
          "This project does not exist in this house."
        );
      }
    }

    const entry = await this.prisma.timeEntry.create({
      data: {
        organizationId: houseId,
        userId,
        date: dto.date.trim(),
        hours: dto.hours,
        phase: dto.phase ?? "Production",
        projectId: dto.projectId ?? null,
        note: dto.note?.trim() || null
      }
    });

    return toTimeEntryDto(entry);
  }
}

function toTimeEntryDto(entry: {
  id: string;
  organizationId: string;
  projectId: string | null;
  userId: string;
  phase: string;
  hours: number;
  date: string;
  note: string | null;
}) {
  return {
    id: entry.id,
    organizationId: entry.organizationId,
    projectId: entry.projectId,
    userId: entry.userId,
    phase: entry.phase,
    hours: entry.hours,
    date: entry.date,
    note: entry.note
  };
}
