"use client";

import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent
} from "react";
import { Eraser, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 360;
const COLORS = [
  "#11142c",
  "#654cff",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#ffffff"
];

type Point = { x: number; y: number };

export function DrawingCanvasDialog({
  open,
  onOpenChange,
  initialImageUrl,
  onSave
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialImageUrl: string | null;
  onSave: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [lineWidth, setLineWidth] = useState(4);
  const isDrawing = useRef(false);
  const lastPoint = useRef<Point | null>(null);
  const hasLoadedImage = useRef(false);

  function paintBackground(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // Runs once per open (canvas is only mounted while the dialog is open,
  // so a ref-gated draw on the first paint call stands in for an
  // on-open effect without needing useEffect + cleanup here).
  function ensureCanvasReady(canvas: HTMLCanvasElement) {
    if (hasLoadedImage.current) {
      return;
    }
    hasLoadedImage.current = true;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    paintBackground(ctx);
    if (initialImageUrl) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      img.src = initialImageUrl;
    }
  }

  function getPoint(event: ReactPointerEvent<HTMLCanvasElement>): Point {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT
    };
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    isDrawing.current = true;
    lastPoint.current = getPoint(event);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current || !lastPoint.current) {
      return;
    }
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      return;
    }
    const point = getPoint(event);
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = tool === "eraser" ? lineWidth * 4 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPoint.current = point;
  }

  function stopDrawing() {
    isDrawing.current = false;
    lastPoint.current = null;
  }

  function handleClear() {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      paintBackground(ctx);
    }
  }

  function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    onSave(canvas.toDataURL("image/png"));
    onOpenChange(false);
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          hasLoadedImage.current = false;
        }
        onOpenChange(next);
      }}
      open={open}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Draw Shot</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            {COLORS.map((swatch) => (
              <button
                className={`h-6 w-6 rounded-full border-2 transition ${
                  tool === "pen" && color === swatch
                    ? "scale-110 border-[#654cff]"
                    : "border-black/10 dark:border-white/20"
                }`}
                key={swatch}
                onClick={() => {
                  setColor(swatch);
                  setTool("pen");
                }}
                style={{ backgroundColor: swatch }}
                type="button"
              />
            ))}
          </div>

          <button
            className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold ${
              tool === "pen"
                ? "border-[#654cff] bg-[#654cff]/10 text-[#654cff]"
                : "border-black/10 text-[#4b5268] dark:border-white/10 dark:text-[#c7cad9]"
            }`}
            onClick={() => setTool("pen")}
            type="button"
          >
            <Pencil className="h-3.5 w-3.5" />
            Pen
          </button>
          <button
            className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold ${
              tool === "eraser"
                ? "border-[#654cff] bg-[#654cff]/10 text-[#654cff]"
                : "border-black/10 text-[#4b5268] dark:border-white/10 dark:text-[#c7cad9]"
            }`}
            onClick={() => setTool("eraser")}
            type="button"
          >
            <Eraser className="h-3.5 w-3.5" />
            Eraser
          </button>

          <input
            aria-label="Brush size"
            className="w-20 accent-[#654cff]"
            max={16}
            min={2}
            onChange={(event) => setLineWidth(Number(event.target.value))}
            step={1}
            type="range"
            value={lineWidth}
          />

          <button
            className="flex h-8 items-center gap-1.5 rounded-lg border border-black/10 px-2.5 text-xs font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
            onClick={handleClear}
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>

        <canvas
          className="w-full touch-none rounded-xl border border-black/10 bg-white dark:border-white/10"
          height={CANVAS_HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerLeave={stopDrawing}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          ref={(node) => {
            canvasRef.current = node;
            if (node) {
              ensureCanvasReady(node);
            }
          }}
          width={CANVAS_WIDTH}
        />

        <DialogFooter>
          <Button
            className="h-9 rounded-lg border-black/10 px-4 text-sm font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="h-9 rounded-lg bg-[#654cff] px-4 text-sm font-bold text-white hover:bg-[#5a41ea]"
            onClick={handleSave}
            type="button"
          >
            Save Drawing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
