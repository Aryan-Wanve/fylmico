"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

// Displayed size of the square crop viewport (CSS px). The exported image is
// rendered at OUTPUT_SIZE regardless of this, so the viewport can stay small.
const VIEWPORT = 288;
const OUTPUT_SIZE = 512;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

type Point = { x: number; y: number };

export function AvatarCropDialog({
  file,
  open,
  onCancel,
  onConfirm
}: {
  file: File | null;
  open: boolean;
  onCancel: () => void;
  onConfirm: (cropped: File) => void;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    base: Point;
  } | null>(null);

  // Load the selected file into an object URL and reset the crop transform.
  // This is a genuine external-system sync (creating/revoking a blob URL and
  // resetting the transform to the new file), which is exactly what effects
  // are for - the synchronous setState here is intentional.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!file) {
      setImageSrc(null);
      setNatural(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // At zoom 1 the image's shorter side exactly covers the viewport (cover
  // fit); zoom scales up from there. Everything below is derived from this.
  const baseScale = natural ? VIEWPORT / Math.min(natural.w, natural.h) : 1;
  const dispW = natural ? natural.w * baseScale * zoom : VIEWPORT;
  const dispH = natural ? natural.h * baseScale * zoom : VIEWPORT;

  const clampOffset = useCallback(
    (next: Point): Point => {
      const maxX = Math.max(0, (dispW - VIEWPORT) / 2);
      const maxY = Math.max(0, (dispH - VIEWPORT) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, next.x)),
        y: Math.max(-maxY, Math.min(maxY, next.y))
      };
    },
    [dispW, dispH]
  );

  // Always render/export from a clamped offset (derived, not stored) so a
  // zoom-out can never reveal empty edges without needing a re-clamp effect.
  const clampedOffset = clampOffset(offset);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      base: offset
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    setOffset(
      clampOffset({
        x: drag.base.x + (event.clientX - drag.startX),
        y: drag.base.y + (event.clientY - drag.startY)
      })
    );
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  }

  async function handleConfirm() {
    if (!file || !natural) return;
    setProcessing(true);
    try {
      const cropped = await renderCrop(
        imageSrc,
        natural,
        baseScale,
        zoom,
        clampedOffset
      );
      const outFile = new File([cropped], replaceExtension(file.name, "jpg"), {
        type: "image/jpeg"
      });
      onConfirm(outFile);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Dialog
      onOpenChange={(next) => (next ? undefined : onCancel())}
      open={open}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust your photo</DialogTitle>
        </DialogHeader>

        <div className="grid justify-items-center gap-4">
          <div
            className="relative touch-none overflow-hidden rounded-full border border-black/10 bg-black/5 select-none dark:border-white/10 dark:bg-white/5"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ width: VIEWPORT, height: VIEWPORT, cursor: "grab" }}
          >
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL, not a remote asset
              <img
                alt=""
                className="pointer-events-none absolute top-1/2 left-1/2 max-w-none"
                draggable={false}
                onLoad={(event) =>
                  setNatural({
                    w: event.currentTarget.naturalWidth,
                    h: event.currentTarget.naturalHeight
                  })
                }
                src={imageSrc}
                style={{
                  width: dispW,
                  height: dispH,
                  transform: `translate(-50%, -50%) translate(${clampedOffset.x}px, ${clampedOffset.y}px)`
                }}
              />
            ) : null}
          </div>

          <label className="flex w-full items-center gap-3">
            <span className="text-xs font-semibold text-[#667085] dark:text-[#7d8299]">
              Zoom
            </span>
            <input
              className="flex-1 accent-[var(--fylmico-accent)]"
              max={MAX_ZOOM}
              min={MIN_ZOOM}
              onChange={(event) => setZoom(Number(event.target.value))}
              step={0.01}
              type="range"
              value={zoom}
            />
          </label>
          <p className="text-xs text-[#667085] dark:text-[#7d8299]">
            Drag to reposition, slide to zoom.
          </p>
        </div>

        <DialogFooter className="mt-1">
          <Button disabled={processing} onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button disabled={processing || !natural} onClick={handleConfirm}>
            {processing ? "Saving..." : "Save photo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Maps the visible circular viewport back to source-image pixels and paints
// that square region onto an OUTPUT_SIZE canvas, exported as a JPEG blob.
function renderCrop(
  imageSrc: string | null,
  natural: { w: number; h: number },
  baseScale: number,
  zoom: number,
  offset: Point
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!imageSrc) {
      reject(new Error("No image to crop."));
      return;
    }
    const img = new Image();
    img.onload = () => {
      const scale = baseScale * zoom;
      // Top-left of the displayed image within the viewport (display px).
      const imgLeft = VIEWPORT / 2 + offset.x - (natural.w * scale) / 2;
      const imgTop = VIEWPORT / 2 + offset.y - (natural.h * scale) / 2;
      // Convert the viewport's [0, VIEWPORT] square into source pixels.
      const srcX = -imgLeft / scale;
      const srcY = -imgTop / scale;
      const srcSize = VIEWPORT / scale;

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not process the image."));
        return;
      }
      ctx.drawImage(
        img,
        srcX,
        srcY,
        srcSize,
        srcSize,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
      );
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error("Could not export the image.")),
        "image/jpeg",
        0.9
      );
    };
    img.onerror = () => reject(new Error("Could not load the image."));
    img.src = imageSrc;
  });
}

function replaceExtension(name: string, ext: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  return `${base}.${ext}`;
}
