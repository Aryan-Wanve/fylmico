"use client";

import { useState } from "react";
import { Camera, Pencil, X } from "lucide-react";
import { DrawingCanvasDialog } from "@/components/storyboard/drawing-canvas-dialog";
import type { Shot } from "@/types/base";

export function ShotDetailPanel({
  shot,
  index,
  onClose,
  onUpdate
}: {
  shot: Shot;
  index: number;
  onClose: () => void;
  onUpdate: (updates: {
    description?: string;
    cameraAngle?: string;
    notes?: string;
    imageUrl?: string;
  }) => void;
}) {
  const [drawingOpen, setDrawingOpen] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/[0.06]">
        <strong className="text-sm font-black text-[#11142c] dark:text-[#f1f2f8]">
          Shot {index + 1}
        </strong>
        <button
          aria-label="Close shot details"
          className="grid h-7 w-7 place-items-center rounded-full text-[#8a90a3] hover:bg-black/[0.04] dark:text-[#7d8299] dark:hover:bg-white/[0.06]"
          onClick={onClose}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="group relative flex h-40 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#f4f4f8] to-[#e7e7ee] dark:from-[#20232f] dark:to-[#262a3a]">
          {shot.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- freehand canvas data: URLs aren't compatible with next/image optimization.
            <img
              alt=""
              className="h-full w-full object-contain"
              src={shot.imageUrl}
            />
          ) : (
            <Camera className="h-14 w-14 text-[#8a90a3]/60" strokeWidth={1.1} />
          )}
          <button
            className="absolute right-2 bottom-2 flex h-8 items-center gap-1.5 rounded-lg bg-[#11142c]/80 px-3 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100"
            onClick={() => setDrawingOpen(true)}
            type="button"
          >
            <Pencil className="h-3.5 w-3.5" />
            {shot.imageUrl ? "Edit Drawing" : "Draw Shot"}
          </button>
        </div>

        <DrawingCanvasDialog
          initialImageUrl={shot.imageUrl}
          onOpenChange={setDrawingOpen}
          onSave={(dataUrl) => onUpdate({ imageUrl: dataUrl })}
          open={drawingOpen}
        />

        <div className="mt-5">
          <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            Shot Details
          </strong>

          <label className="mt-3 grid gap-1">
            <span className="text-xs font-bold text-[#8a90a3] uppercase dark:text-[#7d8299]">
              Camera Angle
            </span>
            <input
              className="h-9 rounded-lg border border-black/10 px-2.5 text-sm text-[#11142c] outline-none dark:border-white/10 dark:text-[#f1f2f8]"
              onChange={(event) =>
                onUpdate({ cameraAngle: event.target.value })
              }
              placeholder="e.g. Wide Shot, Close Up"
              value={shot.cameraAngle ?? ""}
            />
          </label>

          <label className="mt-3 grid gap-1">
            <span className="text-xs font-bold text-[#8a90a3] uppercase dark:text-[#7d8299]">
              Description
            </span>
            <textarea
              className="min-h-[4.5rem] rounded-lg border border-black/10 p-2.5 text-sm text-[#11142c] outline-none dark:border-white/10 dark:text-[#f1f2f8]"
              onChange={(event) =>
                onUpdate({ description: event.target.value })
              }
              value={shot.description}
            />
          </label>

          <label className="mt-3 grid gap-1">
            <span className="text-xs font-bold text-[#8a90a3] uppercase dark:text-[#7d8299]">
              Notes
            </span>
            <textarea
              className="min-h-[3.5rem] rounded-lg border border-black/10 p-2.5 text-sm text-[#11142c] outline-none dark:border-white/10 dark:text-[#f1f2f8]"
              onChange={(event) => onUpdate({ notes: event.target.value })}
              placeholder="Lens, movement, or other notes"
              value={shot.notes ?? ""}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
