import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService, type Notification } from "@fylmico/database";
import {
  buildPage,
  resolveLimit,
  type CursorPaginationDto,
  type Page
} from "../common/pagination";
import { AppException } from "../common/exceptions/app.exception";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    type: string,
    title: string,
    body: string
  ): Promise<void> {
    await this.prisma.notification.create({
      data: { userId, type, title, body }
    });
  }

  async list(
    userId: string,
    pagination: CursorPaginationDto
  ): Promise<Page<ReturnType<typeof toNotificationDto>>> {
    const limit = resolveLimit(pagination);
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(pagination.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {})
    });

    const page = buildPage(notifications, limit, pagination.cursor);
    return { ...page, data: page.data.map(toNotificationDto) };
  }

  async markRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId }
    });
    if (!notification || notification.userId !== userId) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "notification_not_found",
        "This notification does not exist."
      );
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: notification.readAt ?? new Date() }
    });

    return toNotificationDto(updated);
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() }
    });
  }
}

function toNotificationDto(notification: Notification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    readAt: notification.readAt,
    createdAt: notification.createdAt
  };
}
