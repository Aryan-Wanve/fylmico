import { AppException, HttpStatus } from "../http";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";
import type { CreateBookingDto } from "./dto/create-booking.dto";

const bookingInclude = {
  resource: true,
  project: true,
  bookedBy: true
} as const;

type BookingWithRelations = Awaited<
  ReturnType<
    typeof prisma.booking.findFirstOrThrow<{ include: typeof bookingInclude }>
  >
>;

class BookingsService {
  private readonly prisma = prisma;

  async list(userId: string, houseId: string) {
    await organizationsService.requireMembership(houseId, userId);

    const bookings = await this.prisma.booking.findMany({
      where: { organizationId: houseId },
      include: bookingInclude,
      orderBy: { createdAt: "desc" }
    });

    return bookings.map(toBookingDto);
  }

  async create(userId: string, houseId: string, dto: CreateBookingDto) {
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

    const resource = await this.findOrCreateResource(
      houseId,
      dto.resourceName.trim(),
      dto.resourceCategory ?? "equipment"
    );

    const booking = await this.prisma.booking.create({
      data: {
        organizationId: houseId,
        resourceId: resource.id,
        projectId: dto.projectId ?? null,
        startDate: dto.startDate.trim(),
        endDate: dto.endDate.trim(),
        startTime: dto.startTime.trim(),
        endTime: dto.endTime.trim(),
        status: dto.status ?? "confirmed",
        bookedById: userId,
        notes: dto.notes?.trim() || null
      },
      include: bookingInclude
    });

    return toBookingDto(booking);
  }

  private async findOrCreateResource(
    organizationId: string,
    name: string,
    category: string
  ) {
    const existing = await this.prisma.resource.findFirst({
      where: {
        organizationId,
        name: { equals: name, mode: "insensitive" }
      }
    });
    if (existing) {
      return existing;
    }

    return this.prisma.resource.create({
      data: { organizationId, name, category }
    });
  }
}

export const bookingsService = new BookingsService();

function toBookingDto(booking: BookingWithRelations) {
  return {
    id: booking.id,
    resourceId: booking.resourceId,
    resourceName: booking.resource.name,
    resourceCategory: booking.resource.category,
    resourceSubtitle: booking.resource.subtitle,
    resourceTag: booking.resource.tag,
    projectId: booking.projectId,
    projectName: booking.project?.name ?? null,
    projectPhase: booking.project?.stage ?? null,
    startDate: booking.startDate,
    endDate: booking.endDate,
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status,
    bookedById: booking.bookedById,
    bookedByName: booking.bookedBy.name,
    notes: booking.notes,
    createdAt: booking.createdAt
  };
}
