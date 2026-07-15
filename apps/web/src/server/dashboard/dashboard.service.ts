import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";

const SHOOT_CATEGORY = "shoot";

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDayKeys(offsets: number[]): string[] {
  const today = new Date();
  return offsets.map((offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    return toDateKey(date);
  });
}

class DashboardService {
  private readonly prisma = prisma;

  async getSummary(userId: string, houseId: string) {
    await organizationsService.requireMembership(houseId, userId);

    const last7DayKeys = buildDayKeys([-6, -5, -4, -3, -2, -1, 0]);
    const next7DayKeys = buildDayKeys([0, 1, 2, 3, 4, 5, 6]);
    const todayKey = last7DayKeys[last7DayKeys.length - 1];

    const [
      projects,
      calendarEvents,
      recentTasks,
      recentMessages,
      recentComments,
      recentTimeEntries
    ] = await Promise.all([
      this.prisma.project.findMany({
        where: { organizationId: houseId, status: { not: "archived" } },
        select: { id: true, createdAt: true, stage: true }
      }),
      this.prisma.calendarEvent.findMany({
        where: { organizationId: houseId, category: SHOOT_CATEGORY },
        select: { date: true, time: true, title: true }
      }),
      this.prisma.task.findMany({
        where: { organizationId: houseId },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { createdBy: true }
      }),
      this.prisma.message.findMany({
        where: { conversation: { organizationId: houseId } },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { author: true }
      }),
      this.prisma.comment.findMany({
        where: { organizationId: houseId },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { author: true }
      }),
      this.prisma.timeEntry.findMany({
        where: { organizationId: houseId },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: true }
      })
    ]);

    const isActiveStage = (stage: string) =>
      stage !== "Completed" && stage !== "On Hold";

    const activeProjects = projects.filter((project) =>
      isActiveStage(project.stage)
    ).length;
    const activeProjectsSparkline = last7DayKeys.map(
      (dayKey) =>
        projects.filter(
          (project) =>
            isActiveStage(project.stage) &&
            toDateKey(project.createdAt) <= dayKey
        ).length
    );

    const upcomingShoots = calendarEvents.filter(
      (event) => event.date >= todayKey && next7DayKeys.includes(event.date)
    );
    const upcomingShootsSparkline = last7DayKeys.map(
      (dayKey) => calendarEvents.filter((event) => event.date === dayKey).length
    );
    const nextShoot = [...upcomingShoots].sort((a, b) =>
      a.date === b.date
        ? a.time.localeCompare(b.time)
        : a.date.localeCompare(b.date)
    )[0];

    const activity = [
      ...recentTasks.map((task) => ({
        id: `task-${task.id}`,
        actorName: task.createdBy.name,
        text: `added a new task "${task.title}"`,
        occurredAt: task.createdAt
      })),
      ...recentMessages.map((message) => ({
        id: `message-${message.id}`,
        actorName: message.author.name,
        text: "sent a message",
        occurredAt: message.createdAt
      })),
      ...recentComments.map((comment) => ({
        id: `comment-${comment.id}`,
        actorName: comment.author.name,
        text: "left a comment",
        occurredAt: comment.createdAt
      })),
      ...recentTimeEntries.map((entry) => ({
        id: `time-entry-${entry.id}`,
        actorName: entry.user.name,
        text: `logged ${entry.hours}h`,
        occurredAt: entry.createdAt
      }))
    ]
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, 8);

    return {
      activeProjects,
      activeProjectsSparkline,
      upcomingShootsCount: upcomingShoots.length,
      upcomingShootsSparkline,
      nextShoot: nextShoot
        ? { date: nextShoot.date, time: nextShoot.time, title: nextShoot.title }
        : null,
      recentActivity: activity
    };
  }
}

export const dashboardService = new DashboardService();
