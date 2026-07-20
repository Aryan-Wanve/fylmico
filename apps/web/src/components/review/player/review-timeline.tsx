"use client";

import { useRef, useState, type MouseEvent } from "react";
import { MessageSquare, PenTool, ZoomIn, ZoomOut } from "lucide-react";
import type { Annotation, Comment, Deliverable } from "@/types/base";
import { usePlayerContext } from "./player-context";
import { formatTimestamp } from "./player-format";

export function ReviewTimeline({
  src,
  comments,
  annotations,
  versions,
  activeVersionId,
  onSelectVersion,
  onSelectComment
}: {
  src: string;
  comments: Comment[];
  annotations: Annotation[];
  versions: Deliverable[];
  activeVersionId: string;
  onSelectVersion: (id: string) => void;
  onSelectComment?: (commentId: string) => void;
}) {
  const { duration, currentTime, seek } = usePlayerContext();
  const [zoom, setZoom] = useState(1);
  const trackRef = useRef<HTMLDivElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<{ x: number; time: number } | null>(null);

  function timeFromClientX(clientX: number): number {
    const track = trackRef.current;
    if (!track || duration === 0) return 0;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * duration;
  }

  function handleTrackClick(event: MouseEvent<HTMLDivElement>) {
    seek(timeFromClientX(event.clientX));
  }

  function handleTrackMouseMove(event: MouseEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const time = timeFromClientX(event.clientX);
    setHover({ x: event.clientX - rect.left, time });

    const previewVideo = previewVideoRef.current;
    if (previewVideo) {
      previewVideo.currentTime = time;
    }
  }

  function handlePreviewSeeked() {
    const previewVideo = previewVideoRef.current;
    const canvas = previewCanvasRef.current;
    if (!previewVideo || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 160;
    canvas.height = 90;
    try {
      ctx.drawImage(previewVideo, 0, 0, 160, 90);
    } catch {
      // Frame not decodable yet (seek still settling) - next mousemove retries.
    }
  }

  const topLevelComments = comments.filter((comment) => !comment.parentId);
  const sortedVersions = [...versions].sort((a, b) => a.version - b.version);

  return (
    <div className="grid gap-2">
      {sortedVersions.length > 1 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {sortedVersions.map((version) => (
            <button
              className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
                version.id === activeVersionId
                  ? "bg-[var(--fylmico-accent)] text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
              key={version.id}
              onClick={() => onSelectVersion(version.id)}
              type="button"
            >
              v{version.version}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          aria-label="Zoom out"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30"
          disabled={zoom <= 1}
          onClick={() => setZoom((current) => Math.max(1, current - 1))}
          type="button"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <div
            className="relative h-14 cursor-pointer rounded-lg bg-white/5"
            onClick={handleTrackClick}
            onMouseLeave={() => setHover(null)}
            onMouseMove={handleTrackMouseMove}
            ref={trackRef}
            style={{ width: `${zoom * 100}%`, minWidth: "100%" }}
          >
            {topLevelComments.map((comment) =>
              comment.timestampSeconds != null && duration > 0 ? (
                <button
                  className="absolute top-1 -translate-x-1/2"
                  key={comment.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    seek(comment.timestampSeconds ?? 0);
                    onSelectComment?.(comment.id);
                  }}
                  title={comment.body}
                  style={{
                    left: `${((comment.timestampSeconds ?? 0) / duration) * 100}%`
                  }}
                  type="button"
                >
                  <MessageSquare className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                </button>
              ) : null
            )}

            {annotations.map((annotation) =>
              duration > 0 ? (
                <button
                  className="absolute bottom-1 -translate-x-1/2"
                  key={annotation.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    seek(annotation.timestampSeconds);
                  }}
                  title={`${annotation.type} annotation`}
                  style={{
                    left: `${(annotation.timestampSeconds / duration) * 100}%`
                  }}
                  type="button"
                >
                  <PenTool className="h-3 w-3 text-[var(--fylmico-accent)]" />
                </button>
              ) : null
            )}

            {duration > 0 ? (
              <div
                className="pointer-events-none absolute top-0 h-full w-0.5 bg-[var(--fylmico-accent)]"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />
            ) : null}

            {hover ? (
              <div
                className="pointer-events-none absolute -top-24 z-10 -translate-x-1/2 rounded-lg border border-white/10 bg-[#11142c] p-1 shadow-lg"
                style={{ left: hover.x }}
              >
                <canvas
                  className="h-[5.625rem] w-40 rounded"
                  ref={previewCanvasRef}
                />
                <span className="mt-0.5 block text-center font-mono text-[10px] text-white/70">
                  {formatTimestamp(hover.time)}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <button
          aria-label="Zoom in"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30"
          disabled={zoom >= 6}
          onClick={() => setZoom((current) => Math.min(6, current + 1))}
          type="button"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Hidden helper element - seeked here to grab hover-preview frames
          via canvas, never rendered/audible to the user. */}
      <video
        className="hidden"
        muted
        onSeeked={handlePreviewSeeked}
        preload="metadata"
        ref={previewVideoRef}
        src={src}
      />
    </div>
  );
}
