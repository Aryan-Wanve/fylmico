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
