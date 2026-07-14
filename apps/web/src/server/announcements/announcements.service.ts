import type { Prisma } from "@fylmico/database";
import { AppException, HttpStatus } from "../http";
import { notificationsService } from "../notifications/notifications.service";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";
import type { CreateAnnouncementDto } from "./dto/create-announcement.dto";
import type { UpdateAnnouncementDto } from "./dto/update-announcement.dto";

const announcementInclude = {
  author: true
} satisfies Prisma.AnnouncementInclude;

type AnnouncementWithRelations = Prisma.AnnouncementGetPayload<{
  include: typeof announcementInclude;
}>;

class AnnouncementsService {
  private readonly prisma = prisma;

  async list(userId: string, houseId: string) {
    await organizationsService.requireMembership(houseId, userId);

    const announcements = await this.prisma.announcement.findMany({
      where: { organizationId: houseId },
      include: announcementInclude,
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }]
    });

    return announcements.map(toAnnouncementDto);
  }

  async create(userId: string, houseId: string, dto: CreateAnnouncementDto) {
    await organizationsService.requireOwnerRole(
      houseId,
      userId,
      "post announcements"
    );

    const announcement = await this.prisma.announcement.create({
      data: {
        organizationId: houseId,
        authorId: userId,
        title: dto.title.trim(),
        body: dto.body.trim(),
        pinned: dto.pinned ?? false
      },
      include: announcementInclude
    });

    const members = await this.prisma.organizationMembership.findMany({
      where: { organizationId: houseId, userId: { not: userId } },
      select: { userId: true }
    });
    await Promise.all(
      members.map((member) =>
        notificationsService.create(
          member.userId,
          "announcement_posted",
          `New announcement: ${announcement.title}`,
          `${announcement.author.name} posted: ${excerpt(announcement.body)}`
        )
      )
    );

    return toAnnouncementDto(announcement);
  }

  async update(
    userId: string,
    announcementId: string,
    dto: UpdateAnnouncementDto
  ) {
    const announcement = await this.findOrThrow(announcementId);
    await organizationsService.requireOwnerRole(
      announcement.organizationId,
      userId,
      "edit announcements"
    );

    const updated = await this.prisma.announcement.update({
      where: { id: announcementId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.body !== undefined ? { body: dto.body.trim() } : {}),
        ...(dto.pinned !== undefined ? { pinned: dto.pinned } : {})
      },
      include: announcementInclude
    });

    return toAnnouncementDto(updated);
  }

  async remove(userId: string, announcementId: string): Promise<void> {
    const announcement = await this.findOrThrow(announcementId);
    await organizationsService.requireOwnerRole(
      announcement.organizationId,
      userId,
      "delete announcements"
    );
    await this.prisma.announcement.delete({ where: { id: announcementId } });
  }

  private async findOrThrow(
    announcementId: string
  ): Promise<AnnouncementWithRelations> {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
      include: announcementInclude
    });
    if (!announcement) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "announcement_not_found",
        "This announcement does not exist."
      );
    }
    return announcement;
  }
}

export const announcementsService = new AnnouncementsService();

function excerpt(body: string, maxLength = 120): string {
  const trimmed = body.trim();
  return trimmed.length > maxLength
    ? `${trimmed.slice(0, maxLength - 1)}…`
    : trimmed;
}

function toAnnouncementDto(announcement: AnnouncementWithRelations) {
  return {
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    pinned: announcement.pinned,
    authorId: announcement.authorId,
    authorName: announcement.author.name,
    createdAt: announcement.createdAt.toISOString(),
    updatedAt: announcement.updatedAt.toISOString()
  };
}
