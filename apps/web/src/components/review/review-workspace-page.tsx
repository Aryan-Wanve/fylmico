"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { useWorkspace } from "@/lib/workspace-context";
import { AvatarWithStatus } from "@/components/layout/avatar-with-status";
import { toInitials } from "@/components/tasks/task-data";
import {
  fpsFromExportSettings,
  PlayerProvider,
  usePlayerContext
} from "@/components/review/player/player-context";
import { ReviewVideoPlayer } from "@/components/review/player/review-video-player";
import { PlayerControlsBar } from "@/components/review/player/player-controls-bar";
import { ReviewTimeline } from "@/components/review/player/review-timeline";
import { AnnotationToolProvider } from "@/components/review/annotation-tool-context";
import { AnnotationToolbar } from "@/components/review/annotation-toolbar";
import { AnnotationCanvas } from "@/components/review/annotation-canvas";
import { CommentThreadPanel } from "@/components/review/comment-thread-panel";
import { ReviewInfoPanel } from "@/components/review/review-info-panel";
import { ReviewActivityPanel } from "@/components/review/review-activity-panel";
import { RequestChangesDialog } from "@/components/review/request-changes-dialog";
import { RejectDialog } from "@/components/review/reject-dialog";
import { ApproveDialog } from "@/components/review/approve-dialog";
import { REVIEW_STATUS_META } from "@/components/review/review-item-card";
import {
  approveDeliverable,
  getFileDownloadUrl,
  getDeliverableActivity,
  getReviewQueueItem,
  listDeliverableAnnotations,
  listDeliverablesForOwner,
  markDeliverableFirstReviewed,
  rejectDeliverable,
  requestDeliverableRevision
} from "@/services/base-workspace.service";
import type {
  Annotation,
  ApproveDeliverableOptions,
  Comment,
  Deliverable,
  DeliverableActivityEntry,
  ReviewQueueItem
} from "@/types/base";

type RightTab = "comments" | "info" | "activity";

// Pure data-fetcher (no setState of its own) so the effect that calls it
// can set every piece of state itself, inside a single .then() - keeping
// state updates out of the effect body's synchronous top level.
async function fetchWorkspaceData(id: string): Promise<{
  item: ReviewQueueItem;
  videoUrl: string;
  annotations: Annotation[];
  activity: DeliverableActivityEntry[];
  versions: Deliverable[];
}> {
  const item = await getReviewQueueItem(id);

  // Video is essential to the workspace, so its failure still fails the
  // whole load - but annotations/activity are secondary panels and
  // shouldn't take the entire page down with them if one hiccups.
  const [videoUrl, annotations, activity] = await Promise.all([
    getFileDownloadUrl(item.file.id),
    listDeliverableAnnotations(id).catch(() => []),
    getDeliverableActivity(id).catch(() => [])
  ]);

  let versions: Deliverable[] = [];
  if (item.ownerType && item.ownerId) {
    try {
      const all = await listDeliverablesForOwner({
        ownerType: item.ownerType,
        ownerId: item.ownerId
      });
      versions = all.filter((v) => v.taskId === item.taskId);
    } catch {
      versions = [];
    }
  }

  return { item, videoUrl, annotations, activity, versions };
}

export function ReviewWorkspacePage() {
  const params = useParams<{ deliverableId: string }>();
  const router = useRouter();
  const { activeHouse, workspace } = useWorkspace();
  const myRole = activeHouse?.members.find(
    (member) => member.id === workspace.user.id
  )?.role;
  const isManager = myRole === "Owner" || myRole === "Admin";

  const [item, setItem] = useState<ReviewQueueItem | null>(null);
  const [versions, setVersions] = useState<Deliverable[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activity, setActivity] = useState<DeliverableActivityEntry[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>("comments");
  const [needsChangesOpen, setNeedsChangesOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const deliverableId = params.deliverableId;

  useEffect(() => {
    let cancelled = false;
    fetchWorkspaceData(deliverableId)
      .then((data) => {
        if (cancelled) return;
        setItem(data.item);
        setVideoUrl(data.videoUrl);
        setAnnotations(data.annotations);
        setActivity(data.activity);
        setVersions(data.versions);
      })
      .catch((error) => {
        if (cancelled) return;
        setItem(null);
        if (error instanceof ApiError && error.status === 403) {
          setForbidden(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [deliverableId]);

  async function handleSelectVersion(nextId: string) {
    if (nextId === deliverableId) return;
    router.push(`/review/${nextId}`);
  }

  async function handleApprove(options: ApproveDeliverableOptions) {
    setBusy(true);
    try {
      await approveDeliverable(deliverableId, options);
      router.push("/review");
    } finally {
      setBusy(false);
    }
  }

  async function handleRequestChanges(comment: string) {
    setBusy(true);
    try {
      await requestDeliverableRevision(deliverableId, comment);
      router.push("/review");
    } finally {
      setBusy(false);
    }
  }

  async function handleReject(reason: string) {
    setBusy(true);
    try {
      await rejectDeliverable(deliverableId, reason);
      router.push("/review");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center p-8">
        <p className="text-sm text-white/60">Loading review...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="grid min-h-[60vh] place-items-center gap-3 p-8 text-center">
        <p className="text-sm font-semibold text-[#4b5268] dark:text-[#c7cad9]">
          {forbidden
            ? "Reviewers and Admins only."
            : "This submission couldn't be loaded."}
        </p>
        <button
          className="text-sm font-bold text-[#654cff] hover:underline"
          onClick={() => router.push("/review")}
          type="button"
        >
          Back to Review
        </button>
      </div>
    );
  }

  const fps = fpsFromExportSettings(item.exportSettings);
  const statusMeta = REVIEW_STATUS_META[item.status];
  const isFinalized = item.status === "approved" || item.status === "rejected";

  return (
    <div className="grid gap-4 bg-[#0d0f1f] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <button
          aria-label="Back to Review"
          className="grid h-9 w-9 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
          onClick={() => router.push("/review")}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-black text-white">
              {item.taskTitle ?? item.file.name}
            </h1>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-bold text-white/70">
              v{item.version}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-bold ${statusMeta.className}`}
            >
              {statusMeta.label}
            </span>
          </div>
          <p className="text-xs text-white/40">
            {item.projectTitle ?? item.clientName ?? "No project"}
          </p>
        </div>
        <AvatarWithStatus
          label={toInitials(item.editorName)}
          size="sm"
          userId={item.editorId}
        />
      </div>

      {videoUrl ? (
        <PlayerProvider fps={fps} src={videoUrl}>
          <AnnotationToolProvider>
            <WorkspaceBody
              activity={activity}
              annotations={annotations}
              deliverableId={deliverableId}
              isManager={isManager}
              item={item}
              members={
                activeHouse?.members.map((member) => ({
                  id: member.id,
                  name: member.name
                })) ?? []
              }
              onAnnotationsChange={setAnnotations}
              onSelectVersion={(id) => void handleSelectVersion(id)}
              rightTab={rightTab}
              setRightTab={setRightTab}
              userId={workspace.user.id}
              videoUrl={videoUrl}
              versions={versions}
            />
          </AnnotationToolProvider>
        </PlayerProvider>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-white/10 bg-[#171a28] p-3">
        <button
          className="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          disabled={busy || isFinalized}
          onClick={() => setNeedsChangesOpen(true)}
          type="button"
        >
          Needs Changes
        </button>
        <button
          className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white hover:bg-red-900 disabled:opacity-50"
          disabled={busy || isFinalized}
          onClick={() => setRejectOpen(true)}
          type="button"
        >
          Reject
        </button>
        <button
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50"
          disabled={busy || isFinalized}
          onClick={() => setApproveOpen(true)}
          type="button"
        >
          Approve
        </button>
      </div>

      <RequestChangesDialog
        onOpenChange={setNeedsChangesOpen}
        onSubmit={handleRequestChanges}
        open={needsChangesOpen}
      />
      <RejectDialog
        onOpenChange={setRejectOpen}
        onSubmit={handleReject}
        open={rejectOpen}
      />
      <ApproveDialog
        defaultFileName={item.file.name}
        onOpenChange={setApproveOpen}
        onSubmit={handleApprove}
        open={approveOpen}
      />
    </div>
  );
}

function WorkspaceBody({
  item,
  versions,
  annotations,
  onAnnotationsChange,
  activity,
  deliverableId,
  isManager,
  userId,
  members,
  videoUrl,
  rightTab,
  setRightTab,
  onSelectVersion
}: {
  item: ReviewQueueItem;
  versions: Deliverable[];
  annotations: Annotation[];
  onAnnotationsChange: (annotations: Annotation[]) => void;
  activity: DeliverableActivityEntry[];
  deliverableId: string;
  isManager: boolean;
  userId: string;
  members: { id: string; name: string }[];
  videoUrl: string;
  rightTab: RightTab;
  setRightTab: (tab: RightTab) => void;
  onSelectVersion: (id: string) => void;
}) {
  const { currentTime, currentFrame, paused, seek } = usePlayerContext();
  const [timelineComments, setTimelineComments] = useState<Comment[]>([]);
  const firstReviewMarked = useRef(false);

  useEffect(() => {
    if (!isManager || firstReviewMarked.current) return;
    firstReviewMarked.current = true;
    void markDeliverableFirstReviewed(deliverableId).catch(() => {
      // Best-effort - the review itself already opened successfully.
    });
  }, [isManager, deliverableId]);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_22rem]">
      <div className="grid min-w-0 gap-3">
        <AnnotationToolbar disabled={!paused} />
        <ReviewVideoPlayer
          overlay={
            <AnnotationCanvas
              annotations={annotations}
              deliverableId={deliverableId}
              onAnnotationCreated={(annotation) =>
                onAnnotationsChange([...annotations, annotation])
              }
            />
          }
          src={videoUrl}
        />
        <PlayerControlsBar />
        <ReviewTimeline
          activeVersionId={deliverableId}
          annotations={annotations}
          comments={timelineComments}
          onSelectComment={() => setRightTab("comments")}
          onSelectVersion={onSelectVersion}
          src={videoUrl}
          versions={
            versions.length > 0
              ? versions
              : [
                  {
                    id: deliverableId,
                    ownerType: item.ownerType,
                    ownerId: item.ownerId,
                    ownerName: item.ownerName,
                    projectId: item.projectId,
                    taskId: item.taskId,
                    version: item.version,
                    status: item.status,
                    notes: item.notes,
                    file: item.file,
                    createdById: item.editorId,
                    createdByName: item.editorName,
                    createdAt: item.submittedAt,
                    updatedAt: item.updatedAt
                  }
                ]
          }
        />
      </div>

      <aside className="grid min-h-0 grid-rows-[auto_auto_1fr] gap-3">
        <div className="flex gap-1 rounded-xl border border-white/10 bg-[#171a28] p-1">
          {(
            [
              { id: "comments", label: "Comments" },
              { id: "info", label: "Info" },
              { id: "activity", label: "Activity" }
            ] as const
          ).map((tab) => (
            <button
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-bold ${
                rightTab === tab.id
                  ? "bg-[#654cff] text-white"
                  : "text-white/50 hover:text-white"
              }`}
              key={tab.id}
              onClick={() => setRightTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {rightTab === "info" ? <ReviewInfoPanel item={item} /> : null}
        {rightTab === "activity" ? (
          <div className="overflow-y-auto rounded-2xl border border-white/10 bg-[#171a28] p-3">
            <ReviewActivityPanel entries={activity} />
          </div>
        ) : null}
        {rightTab === "comments" ? (
          <CommentThreadPanel
            currentFrame={currentFrame}
            currentTimeSeconds={currentTime}
            currentUserId={userId}
            deliverableId={deliverableId}
            isManager={isManager}
            members={members}
            onCommentsChange={setTimelineComments}
            onSeek={seek}
          />
        ) : null}
      </aside>
    </div>
  );
}
