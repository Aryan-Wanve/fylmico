import { AppException, HttpStatus } from "../http";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";

const TASK_STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  todo: { label: "To Do", color: "#94a3b8" },
  "in-progress": { label: "In Progress", color: "#3b82f6" },
  review: { label: "Review", color: "#a855f7" },
  "changes-requested": { label: "Changes Requested", color: "#f59e0b" },
  completed: { label: "Completed", color: "#16c784" },
  archived: { label: "Archived", color: "#64748b" }
};

const PHASE_ORDER = [
  "Pre-Production",
  "Production",
  "Post-Production",
  "Planning"
] as const;

const PHASE_COLOR: Record<string, string> = {
  "Pre-Production": "#3b82f6",
  Production: "#16c784",
  "Post-Production": "#f97316",
  Planning: "#ef4444"
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEATMAP_TIME_LABELS = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM"];
const WEEKLY_HOURS_CAPACITY = 40;

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

class AnalyticsService {
  private readonly prisma = prisma;

  async getAnalytics(userId: string, houseId: string, rangeDays = 7) {
    await organizationsService.requireMembership(houseId, userId);

    const [
      projects,
      tasks,
      timeEntries,
      memberships,
      crewProfiles,
      taskTimestamps,
      messageTimestamps,
      commentTimestamps,
      taskTimeEntries
    ] = await Promise.all([
      this.prisma.project.findMany({
        where: { organizationId: houseId, status: { not: "archived" } }
      }),
      this.prisma.task.findMany({
        where: { organizationId: houseId, isTemplate: false }
      }),
      this.prisma.timeEntry.findMany({ where: { organizationId: houseId } }),
      this.prisma.organizationMembership.findMany({
        where: { organizationId: houseId },
        include: { user: true }
      }),
      this.prisma.crewProfile.findMany({ where: { organizationId: houseId } }),
      this.prisma.task.findMany({
        where: { organizationId: houseId, isTemplate: false },
        select: { createdAt: true }
      }),
      this.prisma.message.findMany({
        where: { conversation: { organizationId: houseId } },
        select: { createdAt: true }
      }),
      this.prisma.comment.findMany({
        where: { organizationId: houseId },
        select: { createdAt: true }
      }),
      this.prisma.taskTimeEntry.findMany({
        where: { task: { organizationId: houseId } },
        select: { durationMinutes: true }
      })
    ]);

    const totalProjects = projects.length;
    const activeProjects = projects.filter(
      (project) => project.stage !== "Completed" && project.stage !== "On Hold"
    ).length;

    const tasksTotal = tasks.length;
    const tasksCompleted = tasks.filter(
      (task) => task.status === "completed"
    ).length;
    const teamEfficiency =
      tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

    const hoursLoggedTotal = round1(
      timeEntries.reduce((sum, entry) => sum + entry.hours, 0)
    );

    const taskStatusBreakdown = Object.entries(TASK_STATUS_DISPLAY).map(
      ([status, meta]) => ({
        status,
        label: meta.label,
        color: meta.color,
        count: tasks.filter((task) => task.status === status).length
      })
    );

    const rangeDaysList = buildLastNDays(rangeDays);
    const timeLoggedByDay = rangeDaysList.map((day) => ({
      date: day.key,
      label: DAY_LABELS[mondayIndex(day.date)],
      hours: round1(
        timeEntries
          .filter((entry) => entry.date === day.key)
          .reduce((sum, entry) => sum + entry.hours, 0)
      )
    }));

    const timeDistribution = PHASE_ORDER.map((phase) => ({
      phase,
      color: PHASE_COLOR[phase],
      hours: round1(
        timeEntries
          .filter((entry) => entry.phase === phase)
          .reduce((sum, entry) => sum + entry.hours, 0)
      )
    }));

    const topActiveProjects = [...projects]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 4)
      .map((project) => ({
        id: project.id,
        title: project.name,
        progress: project.progress,
        coverGradient: project.coverGradient,
        coverIcon: project.coverIcon
      }));

    const PROJECT_LINE_COLORS = ["#654cff", "#3b82f6", "#16c784", "#f97316"];
    const projectHoursSeries = topActiveProjects.map((project, index) => ({
      id: project.id,
      label: project.title,
      color: PROJECT_LINE_COLORS[index % PROJECT_LINE_COLORS.length],
      points: rangeDaysList.map((day) =>
        round1(
          timeEntries
            .filter(
              (entry) =>
                entry.projectId === project.id && entry.date === day.key
            )
            .reduce((sum, entry) => sum + entry.hours, 0)
        )
      )
    }));

    const hoursByUser = new Map<string, number>();
    for (const entry of timeEntries) {
      hoursByUser.set(
        entry.userId,
        (hoursByUser.get(entry.userId) ?? 0) + entry.hours
      );
    }
    const userNameById = new Map(
      memberships.map((membership) => [membership.userId, membership.user.name])
    );
    const topContributors = [...hoursByUser.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([userId, hours]) => ({
        userId,
        name: userNameById.get(userId) ?? "Unknown",
        hours: round1(hours)
      }));

    const last7DayKeys = new Set(buildLastNDays(7).map((day) => day.key));
    const jobTitleByUser = new Map(
      crewProfiles.map((profile) => [profile.userId, profile.jobTitle])
    );
    const teamWorkload = memberships
      .map((membership) => {
        const weeklyHours = timeEntries
          .filter(
            (entry) =>
              entry.userId === membership.userId && last7DayKeys.has(entry.date)
          )
          .reduce((sum, entry) => sum + entry.hours, 0);
        return {
          userId: membership.userId,
          name: membership.user.name,
          jobTitle: jobTitleByUser.get(membership.userId) ?? null,
          percentage: Math.min(
            100,
            Math.round((weeklyHours / WEEKLY_HOURS_CAPACITY) * 100)
          )
        };
      })
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    const taskEstimateVsActual = {
      estimatedMinutes: tasks.reduce(
        (sum, task) => sum + (task.estimatedMinutes ?? 0),
        0
      ),
      actualMinutes: taskTimeEntries.reduce(
        (sum, entry) => sum + (entry.durationMinutes ?? 0),
        0
      )
    };

    const activityHeatmap = buildActivityHeatmap([
      ...taskTimestamps.map((row) => row.createdAt),
      ...messageTimestamps.map((row) => row.createdAt),
      ...commentTimestamps.map((row) => row.createdAt),
      ...timeEntries.map((entry) => entry.createdAt)
    ]);

    return {
      totalProjects,
      activeProjects,
      tasksTotal,
      tasksCompleted,
      hoursLoggedTotal,
      teamEfficiency,
      taskStatusBreakdown,
      timeLoggedByDay,
      timeDistribution,
      topActiveProjects,
      projectHoursSeries,
      topContributors,
      teamWorkload,
      taskEstimateVsActual,
      activityHeatmap
    };
  }

  async getMyStats(userId: string, houseId: string) {
    await organizationsService.requireMembership(houseId, userId);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    const today = toDateKey(new Date());

    const [myTasks, taskTimeEntries, timeEntries] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          organizationId: houseId,
          isTemplate: false,
          assignees: { some: { userId } }
        },
        select: { status: true, dueDate: true, updatedAt: true }
      }),
      this.prisma.taskTimeEntry.findMany({
        where: { userId, task: { organizationId: houseId } },
        select: { startedAt: true, durationMinutes: true }
      }),
      this.prisma.timeEntry.findMany({
        where: { userId, organizationId: houseId },
        select: { date: true, hours: true }
      })
    ]);

    const completedTasks = myTasks.filter(
      (task) => task.status === "completed"
    );
    const tasksCompleted = completedTasks.length;
    const tasksPending = myTasks.filter(
      (task) => task.status !== "completed" && task.status !== "archived"
    ).length;
    const completionRate =
      myTasks.length > 0
        ? Math.round((tasksCompleted / myTasks.length) * 100)
        : 0;

    const completedWithDueDate = completedTasks.filter(
      (task) => task.dueDate !== null
    );
    const onTimeCount = completedWithDueDate.filter(
      (task) => task.dueDate !== null && task.updatedAt <= task.dueDate
    ).length;
    const onTimePercentage =
      completedWithDueDate.length > 0
        ? Math.round((onTimeCount / completedWithDueDate.length) * 100)
        : 100;

    let todayMinutes = 0;
    let weekMinutes = 0;
    let monthMinutes = 0;
    let totalMinutes = 0;
    const activeDays = new Set<string>();

    for (const entry of taskTimeEntries) {
      const minutes = entry.durationMinutes ?? 0;
      const dayKey = toDateKey(entry.startedAt);
      activeDays.add(dayKey);
      totalMinutes += minutes;
      if (entry.startedAt >= startOfMonth) monthMinutes += minutes;
      if (entry.startedAt >= startOfWeek) weekMinutes += minutes;
      if (dayKey === today) todayMinutes += minutes;
    }

    for (const entry of timeEntries) {
      const minutes = entry.hours * 60;
      const entryDate = new Date(entry.date);
      activeDays.add(entry.date);
      totalMinutes += minutes;
      if (entryDate >= startOfMonth) monthMinutes += minutes;
      if (entryDate >= startOfWeek) weekMinutes += minutes;
      if (entry.date === today) todayMinutes += minutes;
    }

    return {
      tasksCompleted,
      tasksPending,
      completionRate,
      onTimePercentage,
      workingHours: {
        today: round1(todayMinutes / 60),
        week: round1(weekMinutes / 60),
        month: round1(monthMinutes / 60),
        total: round1(totalMinutes / 60)
      },
      workStreak: computeStreak(activeDays)
    };
  }

  async getProjectAnalytics(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    });
    if (!project) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        "project_not_found",
        "This project does not exist."
      );
    }
    await organizationsService.requireMembership(
      project.organizationId,
      userId
    );

    const today = toDateKey(new Date());

    const [shoots, timeEntries, taskTimeEntries, folders, deliverables] =
      await Promise.all([
        this.prisma.shoot.findMany({
          where: { projectId },
          select: { status: true, scheduledDate: true }
        }),
        this.prisma.timeEntry.findMany({
          where: { projectId },
          select: { hours: true }
        }),
        this.prisma.taskTimeEntry.findMany({
          where: { task: { projectId, isTemplate: false } },
          select: { durationMinutes: true, task: { select: { type: true } } }
        }),
        this.prisma.fileEntry.findMany({
          where: {
            organizationId: project.organizationId,
            driveKey: { startsWith: `project:${projectId}` }
          },
          select: { id: true }
        }),
        this.prisma.deliverable.findMany({
          where: { projectId },
          select: {
            status: true,
            version: true,
            createdAt: true,
            updatedAt: true
          }
        })
      ]);

    const shootsCompleted = shoots.filter(
      (shoot) => shoot.status === "archived"
    ).length;
    const shootsUpcoming = shoots.filter(
      (shoot) =>
        shoot.status === "scheduled" &&
        shoot.scheduledDate.slice(0, 10) >= today
    ).length;

    const editingMinutes = taskTimeEntries
      .filter((entry) => entry.task.type === "edit")
      .reduce((sum, entry) => sum + (entry.durationMinutes ?? 0), 0);
    const teamMinutes = taskTimeEntries.reduce(
      (sum, entry) => sum + (entry.durationMinutes ?? 0),
      0
    );
    const teamHours =
      round1(teamMinutes / 60) +
      round1(timeEntries.reduce((sum, entry) => sum + entry.hours, 0));

    const fileAgg = await this.prisma.fileEntry.aggregate({
      where: { parentId: { in: folders.map((folder) => folder.id) } },
      _sum: { size: true },
      _count: true
    });

    const reviewedDeliverables = deliverables.filter(
      (deliverable) =>
        deliverable.status !== "review" &&
        deliverable.updatedAt.getTime() !== deliverable.createdAt.getTime()
    );
    const avgReviewHours =
      reviewedDeliverables.length > 0
        ? round1(
            reviewedDeliverables.reduce(
              (sum, deliverable) =>
                sum +
                (deliverable.updatedAt.getTime() -
                  deliverable.createdAt.getTime()) /
                  3600000,
              0
            ) / reviewedDeliverables.length
          )
        : 0;
    const revisionCount = deliverables.filter(
      (deliverable) => deliverable.status === "revision"
    ).length;

    return {
      shootsCompleted,
      shootsUpcoming,
      editingHours: round1(editingMinutes / 60),
      teamHours,
      storageBytes: fileAgg._sum.size ?? 0,
      filesUploaded: fileAgg._count,
      deliverableCount: deliverables.length,
      avgReviewHours,
      revisionCount,
      completionPercent: project.progress
    };
  }
}

export const analyticsService = new AnalyticsService();

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function buildLastNDays(count: number): { key: string; date: Date }[] {
  const days: { key: string; date: Date }[] = [];
  const today = new Date();
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    days.push({ key: toDateKey(date), date });
  }
  return days;
}

function computeStreak(dateKeys: Set<string>): {
  current: number;
  best: number;
} {
  if (dateKeys.size === 0) {
    return { current: 0, best: 0 };
  }

  const sorted = [...dateKeys].sort();
  let best = 1;
  let run = 1;
  for (let index = 1; index < sorted.length; index += 1) {
    const diffDays = Math.round(
      (new Date(sorted[index]).getTime() -
        new Date(sorted[index - 1]).getTime()) /
        86400000
    );
    run = diffDays === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 86400000));
  const anchor = dateKeys.has(today)
    ? today
    : dateKeys.has(yesterday)
      ? yesterday
      : null;

  let current = 0;
  let cursor = anchor ? new Date(anchor) : null;
  while (cursor && dateKeys.has(toDateKey(cursor))) {
    current += 1;
    cursor = new Date(cursor.getTime() - 86400000);
  }

  return { current, best };
}

function buildActivityHeatmap(timestamps: Date[]) {
  const matrix = Array.from({ length: 7 }, () => new Array(6).fill(0));

  for (const timestamp of timestamps) {
    const dayIndex = mondayIndex(timestamp);
    const bucketIndex = Math.min(5, Math.floor(timestamp.getHours() / 4));
    matrix[dayIndex][bucketIndex] += 1;
  }

  const maxCount = Math.max(1, ...matrix.flat());
  const intensityMatrix = matrix.map((row) =>
    row.map((count) =>
      count === 0 ? 0 : Math.max(1, Math.round((count / maxCount) * 4))
    )
  );

  return {
    dayLabels: DAY_LABELS,
    timeLabels: HEATMAP_TIME_LABELS,
    matrix: intensityMatrix
  };
}
