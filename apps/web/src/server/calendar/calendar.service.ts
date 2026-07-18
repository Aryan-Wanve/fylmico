import { organizationsService } from "../organizations/organizations.service";
import { ownerWhere, resolveOwner, toOwnerDto } from "../owners/owners.util";
import { prisma } from "../prisma";
import type { CreateCalendarEventDto } from "./dto/create-calendar-event.dto";

const eventInclude = { project: true, client: true } as const;

class CalendarService {
  private readonly prisma = prisma;

  async list(userId: string, houseId: string) {
    await organizationsService.requireMembership(houseId, userId);

    const events = await this.prisma.calendarEvent.findMany({
      where: { organizationId: houseId },
      include: eventInclude,
      orderBy: [{ date: "asc" }, { time: "asc" }]
    });

    return events.map(toCalendarEventDto);
  }

  async create(userId: string, houseId: string, dto: CreateCalendarEventDto) {
    await organizationsService.requireMembership(houseId, userId);

    const owner =
      dto.ownerType && dto.ownerId
        ? await resolveOwner(houseId, {
            ownerType: dto.ownerType,
            ownerId: dto.ownerId
          })
        : null;

    const event = await this.prisma.calendarEvent.create({
      data: {
        organizationId: houseId,
        createdById: userId,
        title: dto.title.trim(),
        date: dto.date.trim(),
        time: dto.time.trim(),
        location: dto.location?.trim() || null,
        category: dto.category ?? "other",
        ...(owner ? ownerWhere(owner) : {})
      },
      include: eventInclude
    });

    return toCalendarEventDto(event);
  }
}

export const calendarService = new CalendarService();

function toCalendarEventDto(event: {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string | null;
  category: string;
  projectId: string | null;
  clientId: string | null;
  organizationId: string;
  project?: { id: string; name: string } | null;
  client?: { id: string; name: string } | null;
}) {
  const owner = toOwnerDto(event);
  return {
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
    category: event.category,
    ownerType: owner?.ownerType ?? null,
    ownerId: owner?.ownerId ?? null,
    ownerName: owner?.ownerName ?? null,
    projectId: event.projectId,
    organizationId: event.organizationId
  };
}
