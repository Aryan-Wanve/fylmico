"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Camera,
  Loader2,
  Pencil,
  Send
} from "lucide-react";
import { useWorkspace } from "@/lib/workspace-context";
import { formatRelativeTime } from "@/lib/relative-time";
import {
  approveDeliverable,
  archiveProject,
  createProjectComment,
  createShoot,
  getProject,
  listCalendarEvents,
  listDeliverables,
  listProjectComments,
  listShoots,
  requestDeliverableRevision,
  updateProject
} from "@/services/base-workspace.service";
import {
  COVER_ICONS,
  STAGE_BADGE_STYLES,
  STATUS_LABELS,
  isProjectOverdue
} from "@/components/projects/project-data";
import { PRIORITY_META, toInitials } from "@/components/tasks/task-data";
import { TeamAvatarStack } from "@/components/projects/team-avatar-stack";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProjectEditDialog } from "@/components/projects/project-edit-dialog";
import { ShootCreateDialog } from "@/components/projects/shoot-create-dialog";
import { DeliverableRow } from "@/components/projects/deliverable-row";
import { ProjectActivityTimeline } from "@/components/projects/project-activity-timeline";
import { ProjectAnalyticsPanel } from "@/components/projects/project-analytics-panel";
import { ProjectChatPanel } from "@/components/projects/project-chat-panel";
import type {
  CalendarEvent,
  Comment,
  CreateShootRequest,
  Deliverable,
  Project,
  Shoot,
  UpdateProjectRequest
} from "@/types/base";

const SHOOT_STATUS_LABELS: Record<Shoot["status"], string> = {
  scheduled: "Scheduled",
  "crew-reached": "Crew Reached",
  started: "In Progress",
  finished: "Finished",
  uploading: "Uploading Data",
  uploaded: "Data Uploaded",
  "ready-for-editing": "Ready For Editing",
  archived: "Archived",
  cancelled: "Cancelled"
};

export function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const { activeHouse, workspace } = useWorkspace();
  const members = useMemo(() => activeHouse?.members ?? [], [activeHouse]);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentDraft, setCommentDraft] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [shootCreateOpen, setShootCreateOpen] = useState(false);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);

  useEffect(() => {
    let cancelled = false;

    getProject(params.projectId)
      .then((data) => {
        if (!cancelled) {
          setProject(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    listCalendarEvents()
      .then((data) => {
        if (!cancelled) {
          setEvents(data);
        }
      })
      .catch(() => undefined);

    listProjectComments(params.projectId)
      .then((data) => {
        if (!cancelled) {
          setComments(data);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setCommentsLoading(false);
        }
      });

    listShoots(params.projectId)
      .then((data) => {
        if (!cancelled) {
          setShoots(data);
        }
      })
      .catch(() => undefined);

    listDeliverables(params.projectId)
      .then((data) => {
        if (!cancelled) {
          setDeliverables(data);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [params.projectId]);

  async function refreshDeliverables() {
    const data = await listDeliverables(params.projectId);
    setDeliverables(data);
  }

  const tasks = useMemo(
    () =>
      project
        ? workspace.tasks.filter((task) => task.projectId === project.id)
        : [],
    [workspace.tasks, project]
  );

  // Team is the union of manually-added teamIds and everyone assigned
  // through the project's tasks - assigning someone via a task is enough
  // for them to show up here, no separate step needed.
  const teamMemberIds = useMemo(() => {
    const ids = new Set(project?.teamIds ?? []);
    for (const task of tasks) {
      for (const assignee of task.assignees) {
        ids.add(assignee.userId);
      }
    }
    return [...ids];
  }, [project, tasks]);

  const projectEvents = useMemo(
    () => events.filter((event) => event.projectId === params.projectId),
    [events, params.projectId]
  );

  async function handleSave(request: UpdateProjectRequest) {
    const updated = await updateProject(params.projectId, request);
    setProject(updated);
  }

  async function handleArchive() {
    if (
      !window.confirm(
        "Archive this project? It will be removed from the active list."
      )
    ) {
      return;
    }
    try {
      await archiveProject(params.projectId);
      router.push("/projects");
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not archive the project."
      );
    }
  }

  async function handlePostComment() {
    if (!commentDraft.trim()) {
      return;
    }
    setPostingComment(true);
    try {
      const comment = await createProjectComment(
        params.projectId,
        commentDraft.trim()
      );
      setComments((current) => [...current, comment]);
      setCommentDraft("");
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not post the comment."
      );
    } finally {
      setPostingComment(false);
    }
  }

  async function handleCreateShoot(request: CreateShootRequest) {
    const shoot = await createShoot(params.projectId, request);
    setShoots((current) => [...current, shoot]);
  }

  if (loading) {
    return (
      <div className="grid min-h-[24rem] place-items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--fylmico-accent)]" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="grid min-h-[24rem] place-items-center gap-3 p-8 text-center">
        <p className="text-lg font-bold text-[#11142c] dark:text-[#f1f2f8]">
          Project not found
        </p>
        <Button onClick={() => router.push("/projects")} variant="outline">
          Back to Projects
        </Button>
      </div>
    );
  }

  const Icon = project.coverIcon ? COVER_ICONS[project.coverIcon] : null;
  const overdue = isProjectOverdue(project);

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:p-8">
      <button
        className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[#5f667d] hover:text-[#11142c] dark:text-[#a8acbf] dark:hover:text-[#f1f2f8]"
        onClick={() => router.push("/projects")}
        type="button"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </button>

      <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <div
          className={`relative flex h-40 w-full items-center justify-center bg-gradient-to-br sm:h-48 ${project.coverGradient ?? "from-slate-400 via-slate-600 to-slate-800"}`}
        >
          {Icon ? <Icon className="h-14 w-14 text-white/30" /> : null}
          <span
            className={`absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold ${PRIORITY_META[project.priority].badge}`}
          >
            {PRIORITY_META[project.priority].label} Priority
          </span>
          <span
            className={`absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold text-white ${STAGE_BADGE_STYLES[project.stage]}`}
          >
            {project.stage}
          </span>
        </div>

        <div className="grid min-w-0 gap-4 p-6">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
                {project.title}
              </h1>
              <span className="text-sm text-[#667085] dark:text-[#878ca0]">
                {project.type ?? "No type"} &bull; {project.genre || "No genre"}{" "}
                &bull; {STATUS_LABELS[project.status]}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                className="h-9 rounded-lg border-black/10 px-3.5 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
                onClick={() => setEditOpen(true)}
                variant="outline"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                className="h-9 rounded-lg border-red-200 px-3.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                onClick={handleArchive}
                variant="outline"
              >
                Archive
              </Button>
            </div>
          </div>

          {project.description ? (
            <p className="text-sm leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
              {project.description}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-6 border-t border-black/5 pt-4 dark:border-white/[0.06]">
            <div className="flex min-w-40 flex-1 items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-[var(--fylmico-accent)]"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-[#5f667d] dark:text-[#a8acbf]">
                {project.progress}%
              </span>
            </div>
            <span
              className={`text-xs font-semibold ${overdue ? "text-red-600" : "text-[#667085] dark:text-[#878ca0]"}`}
            >
              Due {project.dueDate ?? "TBD"}
            </span>
            <TeamAvatarStack members={members} teamIds={teamMemberIds} />
          </div>
        </div>
      </div>

      <Tabs
        className="max-w-full min-w-0 overflow-x-auto"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList className="shrink-0" variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="shoots">Shoots ({shoots.length})</TabsTrigger>
          <TabsTrigger value="deliverables">
            Deliverables ({deliverables.length})
          </TabsTrigger>
          <TabsTrigger value="calendar">
            Calendar ({projectEvents.length})
          </TabsTrigger>
          <TabsTrigger value="comments">
            Comments ({comments.length})
          </TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-4" value="overview">
          <div className="rounded-2xl border border-black/[0.06] bg-white p-5 text-sm text-[#5f667d] shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28] dark:text-[#a8acbf]">
            {project.description ||
              "No description yet. Click Edit to add one."}
          </div>
        </TabsContent>

        <TabsContent className="mt-4" value="tasks">
          <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
            {tasks.length === 0 ? (
              <p className="p-6 text-center text-sm text-[#667085] dark:text-[#878ca0]">
                No tasks are tagged to this project yet.
              </p>
            ) : (
              tasks.map((task) => {
                const firstAssignee = task.assignees[0];

                return (
                  <div
                    className="flex items-center gap-4 border-b border-black/5 px-4 py-3 last:border-b-0 dark:border-white/[0.06]"
                    key={task.id}
                  >
                    <AvatarWithStatus
                      label={toInitials(firstAssignee?.name ?? "?")}
                      size="sm"
                      userId={firstAssignee?.userId ?? ""}
                    />
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                        {task.title}
                      </strong>
                      <span className="text-xs text-[#667085] dark:text-[#878ca0]">
                        {firstAssignee?.name ?? "Unassigned"} &bull; Due{" "}
                        {task.dueDate ?? "TBD"}
                      </span>
                    </div>
                    <span className="shrink-0 rounded-md bg-black/[0.04] px-2.5 py-1 text-xs font-bold text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]">
                      {task.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent className="mt-4" value="shoots">
          <div className="grid gap-3">
            <div className="flex justify-end">
              <Button
                className="h-9 rounded-lg bg-[var(--fylmico-accent)] px-3.5 text-sm font-bold text-white hover:bg-[var(--fylmico-accent-strong)]"
                onClick={() => setShootCreateOpen(true)}
              >
                <Camera className="h-3.5 w-3.5" />
                Schedule Shoot
              </Button>
            </div>
            <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
              {shoots.length === 0 ? (
                <p className="p-6 text-center text-sm text-[#667085] dark:text-[#878ca0]">
                  No shoots scheduled yet.
                </p>
              ) : (
                shoots.map((shoot) => (
                  <div
                    className="flex items-center gap-4 border-b border-black/5 px-4 py-3 last:border-b-0 dark:border-white/[0.06]"
                    key={shoot.id}
                  >
                    <Camera className="h-4 w-4 shrink-0 text-[var(--fylmico-accent)]" />
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                        {shoot.name}
                      </strong>
                      <span className="text-xs text-[#667085] dark:text-[#878ca0]">
                        {new Date(shoot.scheduledDate).toLocaleDateString()}
                        {shoot.callTime ? ` at ${shoot.callTime}` : ""}
                        {shoot.callTime && shoot.estFinishTime
                          ? ` - ${shoot.estFinishTime}`
                          : ""}
                        {shoot.location ? ` • ${shoot.location}` : ""}
                      </span>
                    </div>
                    <span className="shrink-0 rounded-md bg-black/[0.04] px-2.5 py-1 text-xs font-bold text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]">
                      {SHOOT_STATUS_LABELS[shoot.status]}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent className="mt-4" value="deliverables">
          <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
            {deliverables.length === 0 ? (
              <p className="p-6 text-center text-sm text-[#667085] dark:text-[#878ca0]">
                No deliverables submitted yet. Submit a draft from an editing
                task to create the first version.
              </p>
            ) : (
              [...deliverables].reverse().map((deliverable) => (
                <DeliverableRow
                  deliverable={deliverable}
                  key={deliverable.id}
                  onApprove={async () => {
                    await approveDeliverable(deliverable.id);
                    await refreshDeliverables();
                  }}
                  onRequestRevision={async () => {
                    await requestDeliverableRevision(deliverable.id);
                    await refreshDeliverables();
                  }}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent className="mt-4" value="calendar">
          <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
            {projectEvents.length === 0 ? (
              <p className="p-6 text-center text-sm text-[#667085] dark:text-[#878ca0]">
                No calendar events are linked to this project yet.
              </p>
            ) : (
              projectEvents.map((event) => (
                <div
                  className="flex items-center gap-3 border-b border-black/5 px-4 py-3 last:border-b-0 dark:border-white/[0.06]"
                  key={event.id}
                >
                  <CalendarIcon className="h-4 w-4 shrink-0 text-[var(--fylmico-accent)]" />
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                      {event.title}
                    </strong>
                    <span className="text-xs text-[#667085] dark:text-[#878ca0]">
                      {event.date} at {event.time}
                      {event.location ? ` • ${event.location}` : ""}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent className="mt-4" value="comments">
          <div className="grid gap-4 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
            {commentsLoading ? (
              <p className="text-center text-sm text-[#667085] dark:text-[#878ca0]">
                Loading comments...
              </p>
            ) : comments.length === 0 ? (
              <p className="text-center text-sm text-[#667085] dark:text-[#878ca0]">
                No comments yet. Start the discussion below.
              </p>
            ) : (
              <div className="grid gap-4">
                {comments.map((comment) => (
                  <div className="flex items-start gap-3" key={comment.id}>
                    <AvatarWithStatus
                      label={toInitials(comment.authorName)}
                      size="sm"
                      userId={comment.authorId}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                          {comment.authorName}
                        </strong>
                        <span className="text-xs text-[#667085] dark:text-[#878ca0]">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-[#4b5268] dark:text-[#c7cad9]">
                        {comment.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 border-t border-black/5 pt-4 dark:border-white/[0.06]">
              <input
                className="h-10 flex-1 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-[#11142c] outline-none focus:border-[var(--fylmico-accent)] dark:border-white/10 dark:bg-[#11142c] dark:text-[#f1f2f8]"
                onChange={(event) => setCommentDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handlePostComment();
                  }
                }}
                placeholder="Write a comment..."
                value={commentDraft}
              />
              <Button
                className="h-10 rounded-lg bg-[var(--fylmico-accent)] px-4 text-sm font-bold text-white hover:bg-[var(--fylmico-accent-strong)]"
                disabled={postingComment || !commentDraft.trim()}
                onClick={handlePostComment}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent className="mt-4" value="chat">
          <ProjectChatPanel projectId={params.projectId} />
        </TabsContent>

        <TabsContent className="mt-4" value="timeline">
          <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
            <ProjectActivityTimeline projectId={params.projectId} />
          </div>
        </TabsContent>

        <TabsContent className="mt-4" value="analytics">
          <ProjectAnalyticsPanel projectId={params.projectId} />
        </TabsContent>
      </Tabs>

      {editOpen ? (
        <ProjectEditDialog
          onOpenChange={setEditOpen}
          onSave={handleSave}
          open={editOpen}
          project={project}
        />
      ) : null}

      {shootCreateOpen ? (
        <ShootCreateDialog
          members={members}
          onOpenChange={setShootCreateOpen}
          onSave={handleCreateShoot}
          open={shootCreateOpen}
          tasks={workspace.tasks}
        />
      ) : null}
    </div>
  );
}
