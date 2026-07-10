import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "@fylmico/database";
import { AppException } from "../common/exceptions/app.exception";
import { OrganizationsService } from "../organizations/organizations.service";
import { CreateCalendarEventDto } from "./dto/create-calendar-event.dto";

@Injectable()
export class CalendarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationsService: OrganizationsService
  ) {}

  async list(userId: string, houseId: string) {
    await this.organizationsService.requireMembership(houseId, userId);

    const events = await this.prisma.calendarEvent.findMany({
      where: { organizationId: houseId },
      orderBy: [{ date: "asc" }, { time: "asc" }]
    });

    return events.map(toCalendarEventDto);
  }

  async create(userId: string, houseId: string, dto: CreateCalendarEventDto) {
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

    const event = await this.prisma.calendarEvent.create({
      data: {
        organizationId: houseId,
        createdById: userId,
        title: dto.title.trim(),
        date: dto.date.trim(),
        time: dto.time.trim(),
        location: dto.location?.trim() || null,
        category: dto.category ?? "other",
        projectId: dto.projectId ?? null
      }
    });

    return toCalendarEventDto(event);
  }
}

function toCalendarEventDto(event: {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string | null;
  category: string;
  projectId: string | null;
  organizationId: string;
}) {
  return {
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
    category: event.category,
    projectId: event.projectId,
    organizationId: event.organizationId
  };
}
