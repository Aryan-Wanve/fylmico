import type { Notification } from "@fylmico/database";
import { AppException, HttpStatus } from "../http";
import {
  buildPage,
  resolveLimit,
  type CursorPaginationDto,
  type Page
} from "../pagination";
import { prisma } from "../prisma";

// Maps a notification `type` to the Settings > Notifications preference id
// that governs it (see settings-data.ts's notificationPreferences list).
// Types not listed here are administrative/always-on (house joins, invite
// acceptance, bookings) and aren't user-suppressible.
const TYPE_TO_PREFERENCE_ID: Record<string, string> = {
  task_assigned: "task-reminders",
  task_comment: "comments",
  project_comment: "comments",
  task_status_changed: "task-reminders",
  task_mentioned: "comments",
  task_review_requested: "task-reminders",
  task_completed: "task-reminders",
  deliverable_changes_requested: "task-reminders",
  deliverable_reassigned: "task-reminders",
  deliverable_approved: "task-reminders",
  shoot_cancelled: "task-reminders",
  shoot_uploaded: "task-reminders",
  shoot_ready_for_editing: "task-reminders",
  project_team_added: "task-reminders",
  shoot_issue_reported: "task-reminders",
  shoot_extra_time_requested: "task-reminders"
};

class NotificationsService {
  private readonly prisma = prisma;

  async create(
    userId: string,
    type: string,
    title: string,
    body: string,
    organizationId?: string
  ): Promise<void> {
    const preferenceId = TYPE_TO_PREFERENCE_ID[type];
    if (preferenceId && !(await this.isPushEnabled(userId, preferenceId))) {
      return;
    }

    await this.prisma.notification.create({
      data: { userId, type, title, body, organizationId }
    });
  }

  private async isPushEnabled(
    userId: string,
    preferenceId: string
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPreferences: true }
    });

    const preferences = user?.notificationPreferences;
    if (!Array.isArray(preferences)) {
      return true;
    }

    const saved = preferences.find(
      (entry): entry is { id: string; push?: boolean } =>
        typeof entry === "object" &&
        entry !== null &&
        "id" in entry &&
        (entry as { id: unknown }).id === preferenceId
    );

    // Unset means "use the default", which is enabled for every
    // preference in settings-data.ts - only an explicit false suppresses.
    return saved?.push !== false;
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

export const notificationsService = new NotificationsService();

function toNotificationDto(notification: Notification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    organizationId: notification.organizationId,
    readAt: notification.readAt,
    createdAt: notification.createdAt
  };
}
