import { AppException, HttpStatus } from "../http";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";
import type { CreateTimeEntryDto } from "./dto/create-time-entry.dto";

class TimeEntriesService {
  private readonly prisma = prisma;

  async list(userId: string, houseId: string) {
    await organizationsService.requireMembership(houseId, userId);

    const entries = await this.prisma.timeEntry.findMany({
      where: { organizationId: houseId },
      orderBy: { date: "desc" }
    });

    return entries.map(toTimeEntryDto);
  }

  async create(userId: string, houseId: string, dto: CreateTimeEntryDto) {
    await organizationsService.requireMembership(houseId, userId);

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

export const timeEntriesService = new TimeEntriesService();

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
