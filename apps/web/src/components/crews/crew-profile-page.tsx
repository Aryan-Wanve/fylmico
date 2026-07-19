"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Mail,
  MessageSquare
} from "lucide-react";
import { useWorkspace } from "@/lib/workspace-context";
import { usePrompt } from "@/components/ui/prompt-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  createConversation,
  getEditorStats,
  listBookings,
  listCrew,
  listReviewQueue,
  removeCrewMember,
  updateCrewProfile
} from "@/services/base-workspace.service";
import {
  DEPARTMENT_META,
  ROLE_CATEGORY_META,
  ROLE_CATEGORY_ORDER,
  STATUS_META,
  getInitials
} from "@/components/crews/crew-data";
import { REVIEW_STATUS_META } from "@/components/review/review-item-card";
import { formatDateRange } from "@/components/bookings/bookings-data";
import { formatRelativeTime } from "@/lib/relative-time";
import type {
  Booking,
  CrewMember,
  EditorStats,
  ReviewQueueItem
} from "@/types/base";

function formatRuntime(seconds: number): string {
  if (!seconds) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function CrewProfilePage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const prompt = usePrompt();
  const { refreshWorkspace, workspace } = useWorkspace();

  const [member, setMember] = useState<CrewMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [submissions, setSubmissions] = useState<ReviewQueueItem[]>([]);
  const [editorStats, setEditorStats] = useState<EditorStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    listCrew()
      .then((data) => {
        if (cancelled) {
          return;
        }
        const found = data.find((entry) => entry.id === params.userId);
        if (!found) {
          setNotFound(true);
        } else {
          setMember(found);
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

    listBookings()
      .then((data) => {
        if (!cancelled) {
          setBookings(data);
        }
      })
      .catch(() => undefined);

    listReviewQueue({ editorId: params.userId, status: "all" })
      .then((data) => {
        if (!cancelled) {
          setSubmissions(data);
        }
      })
      .catch(() => undefined);

    getEditorStats(params.userId)
      .then((data) => {
        if (!cancelled) {
          setEditorStats(data);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [params.userId]);

  const memberTasks = useMemo(
    () =>
      workspace.tasks.filter((task) =>
        task.assignees.some((assignee) => assignee.userId === params.userId)
      ),
    [workspace.tasks, params.userId]
  );

  const memberBookings = useMemo(
    () => bookings.filter((booking) => booking.bookedById === params.userId),
    [bookings, params.userId]
  );

  async function handleMessage() {
    if (!member) {
      return;
    }
    try {
      await createConversation({ name: member.name });
      await refreshWorkspace();
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !error.message.toLowerCase().includes("already exists")
      ) {
        window.alert(
          error instanceof Error
            ? error.message
            : "Could not start a conversation."
        );
        return;
      }
    }
    router.push("/messages");
  }

  async function handleEdit() {
    if (!member) {
      return;
    }

    const jobTitle = await prompt("Job title", member.jobTitle);
    if (jobTitle === null) {
      return;
    }

    const tagInput = await prompt(
      `Tag (${ROLE_CATEGORY_ORDER.join(", ")}, or Other)`,
      member.roleCategory
    );
    if (tagInput === null) {
      return;
    }

    const matchedTag = [...ROLE_CATEGORY_ORDER, "Other"].find(
      (option) => option.toLowerCase() === tagInput.trim().toLowerCase()
    );
    if (!matchedTag) {
      window.alert(
        `"${tagInput}" isn't a valid tag. Choose one of: ${ROLE_CATEGORY_ORDER.join(", ")}, Other.`
      );
      return;
    }

    try {
      const updated = await updateCrewProfile(member.id, {
        jobTitle: jobTitle.trim() || member.jobTitle,
        roleCategory: matchedTag as CrewMember["roleCategory"]
      });
      setMember(updated);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not update this member."
      );
    }
  }

  async function handleRemove() {
    if (!member) {
      return;
    }
    if (
      !window.confirm(
        "Remove this person from the house? They'll lose access immediately."
      )
    ) {
      return;
    }

    try {
      await removeCrewMember(member.id);
      router.push("/crews");
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not remove this member."
      );
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[24rem] place-items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#654cff]" />
      </div>
    );
  }

  if (notFound || !member) {
    return (
      <div className="grid min-h-[24rem] place-items-center gap-3 p-8 text-center">
        <p className="text-lg font-bold text-[#11142c] dark:text-[#f1f2f8]">
          Crew member not found
        </p>
        <Button onClick={() => router.push("/crews")} variant="outline">
          Back to Crews
        </Button>
      </div>
    );
  }

  const departmentMeta = DEPARTMENT_META[member.department];
  const DepartmentIcon = departmentMeta.icon;
  const statusMeta = STATUS_META[member.status];
  const roleMeta = ROLE_CATEGORY_META[member.roleCategory];

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:p-8">
      <button
        className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[#5f667d] hover:text-[#11142c] dark:text-[#a8acbf] dark:hover:text-[#f1f2f8]"
        onClick={() => router.push("/crews")}
        type="button"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Crews
      </button>

      <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
                {member.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-sm text-[#8a90a3] dark:text-[#7d8299]">
                  <Mail className="h-3.5 w-3.5" />
                  {member.email}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-bold ${statusMeta.badge}`}
                >
                  {statusMeta.label}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              className="h-9 rounded-lg border-black/10 px-3.5 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
              onClick={handleMessage}
              variant="outline"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Message
            </Button>
            <Button
              className="h-9 rounded-lg border-black/10 px-3.5 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
              onClick={handleEdit}
              variant="outline"
            >
              Edit
            </Button>
            <Button
              className="h-9 rounded-lg border-red-200 px-3.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
              onClick={handleRemove}
              variant="outline"
            >
              Remove
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-black/5 pt-5 sm:grid-cols-2 lg:grid-cols-4 dark:border-white/[0.06]">
          <div>
            <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
              Job Title
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <p className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                {member.jobTitle}
              </p>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[0.65rem] font-bold ${roleMeta.badge}`}
              >
                {member.roleCategory}
              </span>
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
              Department
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`grid h-6 w-6 place-items-center rounded-md ${departmentMeta.bg} ${departmentMeta.color}`}
              >
                <DepartmentIcon className="h-3.5 w-3.5" />
              </span>
              <p className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                {member.department}
              </p>
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
              Current Project
            </span>
            <p className="mt-1 text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
              {member.currentProject ?? "—"}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
              Availability
            </span>
            <p className="mt-1 text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
              {member.availability ?? "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
          <div className="border-b border-black/5 px-5 py-3.5 dark:border-white/[0.06]">
            <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
              Assigned Tasks ({memberTasks.length})
            </strong>
          </div>
          {memberTasks.length === 0 ? (
            <p className="p-6 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
              No tasks assigned yet.
            </p>
          ) : (
            memberTasks.map((task) => (
              <div
                className="flex items-center gap-3 border-b border-black/5 px-5 py-3 last:border-b-0 dark:border-white/[0.06]"
                key={task.id}
              >
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                    {task.title}
                  </strong>
                  <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                    {task.projectTitle ?? "No Project"} &bull; Due{" "}
                    {task.dueDate ?? "TBD"}
                  </span>
                </div>
                <span className="shrink-0 rounded-md bg-black/[0.04] px-2.5 py-1 text-xs font-bold text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]">
                  {task.status}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
          <div className="border-b border-black/5 px-5 py-3.5 dark:border-white/[0.06]">
            <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
              Bookings ({memberBookings.length})
            </strong>
          </div>
          {memberBookings.length === 0 ? (
            <p className="p-6 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
              No bookings made yet.
            </p>
          ) : (
            memberBookings.map((booking) => (
              <div
                className="flex items-center gap-3 border-b border-black/5 px-5 py-3 last:border-b-0 dark:border-white/[0.06]"
                key={booking.id}
              >
                <Calendar className="h-4 w-4 shrink-0 text-[#654cff]" />
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                    {booking.resourceName}
                  </strong>
                  <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                    {formatDateRange(booking.startDate, booking.endDate)}
                  </span>
                </div>
                <span className="shrink-0 rounded-md bg-black/[0.04] px-2.5 py-1 text-xs font-bold text-[#4b5268] dark:bg-white/[0.06] dark:text-[#c7cad9]">
                  {booking.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {editorStats ? (
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
          <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            Editing History
          </strong>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total Edits", value: editorStats.totalEdits },
              { label: "Total Delivered", value: editorStats.totalDelivered },
              {
                label: "Approval Rate",
                value: `${editorStats.approvalRate}%`
              },
              {
                label: "Avg. Review Iterations",
                value: editorStats.avgReviewIterations
              },
              {
                label: "Projects Worked On",
                value: editorStats.projectsWorkedOn
              },
              {
                label: "Clients Worked For",
                value: editorStats.clientsWorkedFor
              },
              {
                label: "Total Runtime Edited",
                value: formatRuntime(editorStats.totalRuntimeSeconds)
              },
              { label: "Portfolio Pieces", value: editorStats.portfolioPieces }
            ].map((stat) => (
              <div
                className="rounded-xl bg-black/[0.02] p-3 dark:bg-white/[0.03]"
                key={stat.label}
              >
                <span className="block text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
                  {stat.label}
                </span>
                <strong className="text-lg font-black text-[#11142c] dark:text-[#f1f2f8]">
                  {stat.value}
                </strong>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <div className="border-b border-black/5 px-5 py-3.5 dark:border-white/[0.06]">
          <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            Submitted Work ({submissions.length})
          </strong>
        </div>
        {submissions.length === 0 ? (
          <p className="p-6 text-center text-sm text-[#8a90a3] dark:text-[#7d8299]">
            No drafts submitted yet.
          </p>
        ) : (
          submissions.map((item) => (
            <div
              className="flex items-center gap-3 border-b border-black/5 px-5 py-3 last:border-b-0 dark:border-white/[0.06]"
              key={item.id}
            >
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                  {item.taskTitle ?? item.file.name} · v{item.version}
                </strong>
                <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                  {item.projectTitle ?? "No Project"} &bull; Submitted{" "}
                  {formatRelativeTime(item.submittedAt)}
                </span>
              </div>
              <span
                className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-bold ${REVIEW_STATUS_META[item.status].className}`}
              >
                {REVIEW_STATUS_META[item.status].label}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
