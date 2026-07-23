"use client";

import { useEffect, type ReactNode } from "react";
import { usePlayerContext } from "./player-context";

export function ReviewVideoPlayer({
  src,
  overlay,
  onAddCommentAtPlayhead
}: {
  src: string;
  overlay?: ReactNode;
  onAddCommentAtPlayhead?: () => void;
}) {
  const {
    videoRef,
    containerRef,
    aspectRatio,
    togglePlay,
    stepFrame,
    seek,
    currentTime,
    toggleFullscreen
  } = usePlayerContext();

  // Keyboard shortcuts are scoped to this workspace (not global) and skip
  // typing targets so they don't hijack the comment composer.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (target?.isContentEditable) return;

      switch (event.key) {
        case " ":
          event.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          event.preventDefault();
          if (event.shiftKey) seek(Math.max(0, currentTime - 1));
          else stepFrame(-1);
          break;
        case "ArrowRight":
          event.preventDefault();
          if (event.shiftKey) seek(currentTime + 1);
          else stepFrame(1);
          break;
        case "j":
        case "J":
          seek(Math.max(0, currentTime - 5));
          break;
        case "l":
        case "L":
          seek(currentTime + 5);
          break;
        case "k":
        case "K":
          togglePlay();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "c":
        case "C":
          onAddCommentAtPlayhead?.();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    togglePlay,
    stepFrame,
    seek,
    currentTime,
    toggleFullscreen,
    onAddCommentAtPlayhead
  ]);

  return (
    <div
      className="relative grid max-h-[75vh] w-full place-items-center overflow-hidden rounded-2xl bg-black"
      ref={containerRef}
      style={{ aspectRatio }}
    >
      <video
        className="h-full w-full object-contain"
        playsInline
        ref={videoRef}
        src={src}
      />
      {overlay}
    </div>
  );
}
