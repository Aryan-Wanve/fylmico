"use client";

import { use, useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PlayerProvider,
  usePlayerContext
} from "@/components/review/player/player-context";
import { ReviewVideoPlayer } from "@/components/review/player/review-video-player";
import { PlayerControlsBar } from "@/components/review/player/player-controls-bar";
import { ReviewTimeline } from "@/components/review/player/review-timeline";
import { ClientApproveDialog } from "@/components/review/public/client-approve-dialog";
import { ClientCommentThread } from "@/components/review/public/client-comment-thread";
import { ClientRequestChangesDialog } from "@/components/review/public/client-request-changes-dialog";
import { OtpGate } from "@/components/review/public/otp-gate";
import { PasswordGate } from "@/components/review/public/password-gate";
import { ReviewCountdown } from "@/components/review/public/review-countdown";
import {
  approveReview,
  getReviewContent,
  getReviewPreview,
  requestReviewChanges,
  ReviewSessionError
} from "@/services/review-session-public.service";
import type {
  ReviewClientComment,
  ReviewContent,
  ReviewPublicPreview
} from "@/types/base";

type Phase = "loading" | "password" | "otp" | "content" | "error";

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-[#f7f7fb] p-6 dark:bg-[#0e0f18]">
      {children}
    </section>
  );
}

export default function ClientReviewPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [phase, setPhase] = useState<Phase>("loading");
  const [preview, setPreview] = useState<ReviewPublicPreview | null>(null);
  const [content, setContent] = useState<ReviewContent | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [approveOpen, setApproveOpen] = useState(false);
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);

  const loadContent = useCallback(
    async (version?: number) => {
      const data = await getReviewContent(token, version);
      setContent(data);
      setPhase("content");
    },
    [token]
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const previewData = await getReviewPreview(token);
      if (cancelled) return;
      setPreview(previewData);

      if (previewData.requiresPassword) {
        setPhase("password");
        return;
      }

      try {
        await loadContent();
      } catch (error) {
        if (cancelled) return;
        if (
          error instanceof ReviewSessionError &&
          error.code === "otp_required"
        ) {
          setPhase("otp");
        } else {
          throw error;
        }
      }
    }

    bootstrap().catch((error) => {
      if (cancelled) return;
      setErrorMessage(
        error instanceof Error ? error.message : "This review link is invalid."
      );
      setPhase("error");
    });

    return () => {
      cancelled = true;
    };
  }, [token, loadContent]);

  function afterGateVerified() {
    loadContent().catch((error) => {
      if (
        error instanceof ReviewSessionError &&
        error.code === "otp_required"
      ) {
        setPhase("otp");
        return;
      }
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
      setPhase("error");
    });
  }

  async function handleApprove() {
    await approveReview(token);
    await loadContent(content?.version);
  }

  async function handleRequestChanges(
    feedback: string,
    priority?: string,
    deadline?: string
  ) {
    await requestReviewChanges(token, feedback, priority, deadline);
    await loadContent(content?.version);
  }

  if (phase === "loading") {
    return (
      <CenteredCard>
        <p className="text-sm text-[#5f667d] dark:text-[#a8acbf]">
          Loading review...
        </p>
      </CenteredCard>
    );
  }

  if (phase === "error") {
    return (
      <CenteredCard>
        <div className="w-full max-w-sm rounded-3xl border border-black/[0.06] bg-white p-8 text-center shadow-[0_1.5rem_5rem_rgba(53,45,124,0.08)] dark:border-white/[0.08] dark:bg-[#171a28]">
          <h1 className="text-xl font-black text-[#11142c] dark:text-[#f1f2f8]">
            This review link isn&apos;t available
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
            {errorMessage}
          </p>
        </div>
      </CenteredCard>
    );
  }

  if (phase === "password") {
    return (
      <CenteredCard>
        <PasswordGate onVerified={afterGateVerified} token={token} />
      </CenteredCard>
    );
  }

  if (phase === "otp" && preview) {
    return (
      <CenteredCard>
        <OtpGate
          clientEmailMasked={preview.clientEmailMasked}
          onVerified={afterGateVerified}
          token={token}
        />
      </CenteredCard>
    );
  }

  if (!content || !preview) {
    return null;
  }

  const locked =
    content.status === "approved" ||
    content.status === "expired" ||
    content.status === "revoked";
  const sortedVersions = [...content.versions].sort(
    (a, b) => a.version - b.version
  );

  return (
    <div className="min-h-screen bg-[#0d0f1f] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid max-w-6xl gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black text-white">
              {content.videoTitle}
            </h1>
            <p className="truncate text-xs text-white/40">
              {preview.projectName ? `${preview.projectName} - ` : ""}
              {content.version ? `v${content.version}` : ""}
            </p>
          </div>
          <ReviewCountdown initialRemainingSeconds={content.remainingSeconds} />
        </header>

        {!content.isCurrentVersion ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300">
            You&apos;re previewing v{content.version}. Approve and Request
            Changes always apply to the version sent for your review, not
            whichever version is currently on screen.
          </div>
        ) : null}

        <PlayerProvider fps={24} src={content.videoUrl}>
          <ClientReviewBody
            activeVersion={content.version}
            allowDownload={content.allowDownload}
            allowFullscreen={content.allowFullscreen}
            comments={content.comments}
            locked={locked}
            onCommentsChange={(comments) =>
              setContent((current) =>
                current ? { ...current, comments } : current
              )
            }
            onSelectVersion={(version) => void loadContent(version)}
            token={token}
            versions={sortedVersions}
            videoUrl={content.videoUrl}
          />
        </PlayerProvider>

        {!locked ? (
          <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-white/10 bg-[#171a28] p-3">
            <Button
              onClick={() => setRequestChangesOpen(true)}
              type="button"
              variant="outline"
            >
              Request Changes
            </Button>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={() => setApproveOpen(true)}
              type="button"
            >
              Approve
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#171a28] p-3 text-center text-sm font-semibold text-white/60">
            {content.status === "approved"
              ? "This version has been approved. Thank you!"
              : "This review link is no longer active."}
          </div>
        )}
      </div>

      <ClientApproveDialog
        onConfirm={handleApprove}
        onOpenChange={setApproveOpen}
        open={approveOpen}
      />
      <ClientRequestChangesDialog
        onOpenChange={setRequestChangesOpen}
        onSubmit={handleRequestChanges}
        open={requestChangesOpen}
      />
    </div>
  );
}

function ClientReviewBody({
  token,
  videoUrl,
  activeVersion,
  comments,
  locked,
  allowDownload,
  allowFullscreen,
  versions,
  onSelectVersion,
  onCommentsChange
}: {
  token: string;
  videoUrl: string;
  activeVersion: number;
  comments: ReviewClientComment[];
  locked: boolean;
  allowDownload: boolean;
  allowFullscreen: boolean;
  versions: { version: number; createdAt: string }[];
  onSelectVersion: (version: number) => void;
  onCommentsChange: (comments: ReviewClientComment[]) => void;
}) {
  const { currentTime, seek } = usePlayerContext();

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_22rem]">
      <div className="grid min-w-0 gap-3">
        {versions.length > 1 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {versions.map((v) => (
              <button
                className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
                  v.version === activeVersion
                    ? "bg-[var(--fylmico-accent)] text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
                key={v.version}
                onClick={() => onSelectVersion(v.version)}
                type="button"
              >
                v{v.version}
              </button>
            ))}
          </div>
        ) : null}

        <ReviewVideoPlayer src={videoUrl} />
        <PlayerControlsBar hideFullscreen={!allowFullscreen} />
        <ReviewTimeline
          activeVersionId=""
          annotations={[]}
          comments={comments}
          onSelectVersion={() => {}}
          src={videoUrl}
          versions={[]}
        />

        {allowDownload ? (
          <a
            className="flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10"
            download
            href={videoUrl}
          >
            <Download className="h-3.5 w-3.5" />
            Download video
          </a>
        ) : null}
      </div>

      <aside className="grid min-h-0">
        <ClientCommentThread
          comments={comments}
          currentTimeSeconds={currentTime}
          locked={locked}
          onCommentsChange={onCommentsChange}
          onSeek={seek}
          token={token}
        />
      </aside>
    </div>
  );
}
