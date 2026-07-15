import { AppException, HttpStatus } from "../http";
import { notificationsService } from "../notifications/notifications.service";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";
import type { CreateBookingDto } from "./dto/create-booking.dto";
import type { UpdateBookingStatusDto } from "./dto/update-booking-status.dto";

type BookingStatus = UpdateBookingStatusDto["status"];

function formatBookingWindow(dto: CreateBookingDto): string {
  return dto.startDate === dto.endDate
    ? `${dto.startDate}, ${dto.startTime}–${dto.endTime}`
    : `${dto.startDate} – ${dto.endDate}`;
}

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
        status: dto.status ?? "pending",
        bookedById: userId,
        notes: dto.notes?.trim() || null
      },
      include: bookingInclude
    });

    const bookingDto = toBookingDto(booking);
    await organizationsService.notifyOwners(
      houseId,
      "booking_created",
      `New booking: ${resource.name}`,
      `${bookingDto.bookedByName} booked ${resource.name} for ${formatBookingWindow(dto)}.`,
      userId
    );

    return bookingDto;
  }

  async updateStatus(userId: string, bookingId: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId }
    });
    if (!booking) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "booking_not_found",
        "This booking does not exist."
      );
    }

    await organizationsService.requireOwnerRole(
      booking.organizationId,
      userId,
      "approve or reject bookings"
    );

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: bookingInclude
    });

    if (updated.bookedById !== userId && status !== "pending") {
      await notificationsService.create(
        updated.bookedById,
        "booking_status_changed",
        `Booking ${status}: ${updated.resource.name}`,
        `Your booking for ${updated.resource.name} was ${status}.`,
        updated.organizationId
      );
    }

    return toBookingDto(updated);
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
