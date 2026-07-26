"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePlayerContext } from "./player-context";

export function ReviewVideoPlayer({
  src,
  overlay,
  onAddCommentAtPlayhead,
  maxHeightVh = 75,
  fillParent = false
}: {
  src: string;
  overlay?: ReactNode;
  onAddCommentAtPlayhead?: () => void;
  // How much viewport height the player may use before it starts
  // shrinking width instead - ignored when fillParent is set.
  maxHeightVh?: number;
  // Fit within the wrapper's actual parent box (a flex/grid cell sized by
  // the page layout) instead of a viewport-vh cap - used by the
  // client-review page, whose whole page is height-constrained to fit in
  // one screen rather than scroll. Reading the wrapper's OWN clientHeight
  // for this would be circular (the wrapper shrink-wraps the box we're
  // computing), so this reads the parent element's height instead, which
  // is set externally by that page's flex layout.
  fillParent?: boolean;
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ width: number; height: number } | null>(
    null
  );

  // aspectRatio alone can't size the box correctly with CSS: a plain div
  // has no intrinsic size, so `max-height` clamping a tall (portrait)
  // ratio doesn't pull width in to match - it just leaves the box at full
  // container width with a clamped height, i.e. squished toward square
  // instead of narrow-and-tall like a Reels player. Computing the actual
  // pixel box here (fit within both the available width AND the height
  // budget, whichever binds first) gives correct "YouTube-style"
  // letterboxing for wide video and "Reels-style" pillarboxing for tall
  // video.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    function recompute() {
      if (!wrapper) return;
      const availableWidth = wrapper.clientWidth;
      const maxHeight = fillParent
        ? (wrapper.parentElement?.clientHeight ??
          window.innerHeight * (maxHeightVh / 100))
        : window.innerHeight * (maxHeightVh / 100);
      let width = availableWidth;
      let height = width / aspectRatio;
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
      setBox({ width, height });
    }

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(wrapper);
    if (fillParent && wrapper.parentElement) {
      observer.observe(wrapper.parentElement);
    }
    window.addEventListener("resize", recompute);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [aspectRatio, maxHeightVh, fillParent]);

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
      className={
        fillParent
          ? "grid h-full min-h-0 w-full place-items-center"
          : "grid w-full place-items-center"
      }
      ref={wrapperRef}
    >
      <div
        className="relative overflow-hidden rounded-2xl bg-black"
        ref={containerRef}
        style={
          box
            ? { width: box.width, height: box.height }
            : {
                aspectRatio,
                width: "100%",
                maxHeight: `${maxHeightVh}vh`
              }
        }
      >
        <video
          className="h-full w-full object-contain"
          playsInline
          ref={videoRef}
          src={src}
        />
        {overlay}
      </div>
    </div>
  );
}
