"use client";

import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent
} from "react";
import { usePrompt } from "@/components/ui/prompt-dialog";
import { createDeliverableAnnotation } from "@/services/base-workspace.service";
import type { Annotation } from "@/types/base";
import { usePlayerContext } from "./player/player-context";
import {
  useAnnotationTool,
  type AnnotationTool
} from "./annotation-tool-context";

type Point = { x: number; y: number };
type ShapeInput = {
  id: string;
  type: Annotation["type"];
  color: string;
  data: Record<string, unknown>;
};

function renderShape(shape: ShapeInput) {
  const { id, type, color, data } = shape;

  switch (type) {
    case "arrow": {
      const d = data as { x1: number; y1: number; x2: number; y2: number };
      const x1 = d.x1 * 100;
      const y1 = d.y1 * 100;
      const x2 = d.x2 * 100;
      const y2 = d.y2 * 100;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const headLen = 3;
      const hx1 = x2 - headLen * Math.cos(angle - Math.PI / 6);
      const hy1 = y2 - headLen * Math.sin(angle - Math.PI / 6);
      const hx2 = x2 - headLen * Math.cos(angle + Math.PI / 6);
      const hy2 = y2 - headLen * Math.sin(angle + Math.PI / 6);
      return (
        <g key={id}>
          <line
            stroke={color}
            strokeWidth={0.6}
            x1={x1}
            x2={x2}
            y1={y1}
            y2={y2}
          />
          <line
            stroke={color}
            strokeWidth={0.6}
            x1={x2}
            x2={hx1}
            y1={y2}
            y2={hy1}
          />
          <line
            stroke={color}
            strokeWidth={0.6}
            x1={x2}
            x2={hx2}
            y1={y2}
            y2={hy2}
          />
        </g>
      );
    }
    case "line": {
      const d = data as { x1: number; y1: number; x2: number; y2: number };
      return (
        <line
          key={id}
          stroke={color}
          strokeWidth={0.6}
          x1={d.x1 * 100}
          x2={d.x2 * 100}
          y1={d.y1 * 100}
          y2={d.y2 * 100}
        />
      );
    }
    case "rectangle": {
      const d = data as { x: number; y: number; w: number; h: number };
      return (
        <rect
          fill="none"
          height={d.h * 100}
          key={id}
          stroke={color}
          strokeWidth={0.6}
          width={d.w * 100}
          x={d.x * 100}
          y={d.y * 100}
        />
      );
    }
    case "highlight": {
      const d = data as { x: number; y: number; w: number; h: number };
      return (
        <rect
          fill={color}
          fillOpacity={0.3}
          height={d.h * 100}
          key={id}
          width={d.w * 100}
          x={d.x * 100}
          y={d.y * 100}
        />
      );
    }
    case "circle": {
      const d = data as { x: number; y: number; rx: number; ry: number };
      return (
        <ellipse
          cx={d.x * 100}
          cy={d.y * 100}
          fill="none"
          key={id}
          rx={d.rx * 100}
          ry={d.ry * 100}
          stroke={color}
          strokeWidth={0.6}
        />
      );
    }
    case "freehand": {
      const d = data as { points: Point[] };
      const points = d.points.map((p) => `${p.x * 100},${p.y * 100}`).join(" ");
      return (
        <polyline
          fill="none"
          key={id}
          points={points}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={0.6}
        />
      );
    }
    default:
      return null;
  }
}

export function AnnotationCanvas({
  deliverableId,
  annotations,
  onAnnotationCreated
}: {
  deliverableId: string;
  annotations: Annotation[];
  onAnnotationCreated: (annotation: Annotation) => void;
}) {
  const { paused, currentTime, currentFrame } = usePlayerContext();
  const { activeTool, setActiveTool, color } = useAnnotationTool();
  const prompt = usePrompt();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Point | null>(null);
  const [freehandPoints, setFreehandPoints] = useState<Point[]>([]);

  const drawable = paused && activeTool !== null;

  function pointFromEvent(event: ReactPointerEvent<HTMLDivElement>): Point {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
    };
  }

  async function persist(type: AnnotationTool, data: Record<string, unknown>) {
    const annotation = await createDeliverableAnnotation(deliverableId, {
      timestampSeconds: currentTime,
      frameNumber: currentFrame,
      type,
      color,
      data
    });
    onAnnotationCreated(annotation);
  }

  async function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drawable || !activeTool) return;
    const point = pointFromEvent(event);

    if (activeTool === "text") {
      const text = await prompt("Annotation text");
      if (text?.trim()) {
        await persist("text", { x: point.x, y: point.y, text: text.trim() });
      }
      setActiveTool(null);
      return;
    }

    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    setDragStart(point);
    setDragCurrent(point);
    if (activeTool === "freehand") setFreehandPoints([point]);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragStart) return;
    const point = pointFromEvent(event);
    setDragCurrent(point);
    if (activeTool === "freehand") {
      setFreehandPoints((current) => [...current, point]);
    }
  }

  async function handlePointerUp() {
    if (!dragStart || !dragCurrent || !activeTool) return;

    if (activeTool === "arrow" || activeTool === "line") {
      await persist(activeTool, {
        x1: dragStart.x,
        y1: dragStart.y,
        x2: dragCurrent.x,
        y2: dragCurrent.y
      });
    } else if (
      activeTool === "rectangle" ||
      activeTool === "highlight" ||
      activeTool === "blur"
    ) {
      await persist(activeTool, {
        x: Math.min(dragStart.x, dragCurrent.x),
        y: Math.min(dragStart.y, dragCurrent.y),
        w: Math.abs(dragCurrent.x - dragStart.x),
        h: Math.abs(dragCurrent.y - dragStart.y)
      });
    } else if (activeTool === "circle") {
      await persist("circle", {
        x: dragStart.x,
        y: dragStart.y,
        rx: Math.abs(dragCurrent.x - dragStart.x),
        ry: Math.abs(dragCurrent.y - dragStart.y)
      });
    } else if (activeTool === "freehand" && freehandPoints.length > 1) {
      await persist("freehand", { points: freehandPoints });
    }

    setDragStart(null);
    setDragCurrent(null);
    setFreehandPoints([]);
    setActiveTool(null);
  }

  // Annotations reappear for a short window as playback crosses their
  // timestamp, and persist while paused exactly at that timestamp.
  const visibleAnnotations = annotations.filter(
    (annotation) => Math.abs(annotation.timestampSeconds - currentTime) < 0.5
  );

  let draftShape: ShapeInput | null = null;
  if (activeTool && dragStart && dragCurrent) {
    if (activeTool === "arrow" || activeTool === "line") {
      draftShape = {
        id: "draft",
        type: activeTool,
        color,
        data: {
          x1: dragStart.x,
          y1: dragStart.y,
          x2: dragCurrent.x,
          y2: dragCurrent.y
        }
      };
    } else if (
      activeTool === "rectangle" ||
      activeTool === "highlight" ||
      activeTool === "blur"
    ) {
      draftShape = {
        id: "draft",
        type: activeTool === "blur" ? "rectangle" : activeTool,
        color,
        data: {
          x: Math.min(dragStart.x, dragCurrent.x),
          y: Math.min(dragStart.y, dragCurrent.y),
          w: Math.abs(dragCurrent.x - dragStart.x),
          h: Math.abs(dragCurrent.y - dragStart.y)
        }
      };
    } else if (activeTool === "circle") {
      draftShape = {
        id: "draft",
        type: "circle",
        color,
        data: {
          x: dragStart.x,
          y: dragStart.y,
          rx: Math.abs(dragCurrent.x - dragStart.x),
          ry: Math.abs(dragCurrent.y - dragStart.y)
        }
      };
    } else if (activeTool === "freehand" && freehandPoints.length > 1) {
      draftShape = {
        id: "draft",
        type: "freehand",
        color,
        data: { points: freehandPoints }
      };
    }
  }

  return (
    <div
      className="absolute inset-0"
      onPointerDown={(event) => void handlePointerDown(event)}
      onPointerMove={handlePointerMove}
      onPointerUp={() => void handlePointerUp()}
      ref={containerRef}
      style={{ pointerEvents: drawable ? "auto" : "none" }}
    >
      <svg
        className={`absolute inset-0 h-full w-full ${drawable ? "cursor-crosshair" : ""}`}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {visibleAnnotations
          .filter((a) => a.type !== "text" && a.type !== "blur")
          .map((annotation) => renderShape(annotation))}
        {draftShape ? renderShape(draftShape) : null}
      </svg>

      {visibleAnnotations
        .filter((annotation) => annotation.type === "text")
        .map((annotation) => {
          const data = annotation.data as {
            x: number;
            y: number;
            text: string;
          };
          return (
            <div
              className="absolute -translate-y-1/2 rounded bg-black/60 px-1.5 py-0.5 text-xs font-bold"
              key={annotation.id}
              style={{
                left: `${data.x * 100}%`,
                top: `${data.y * 100}%`,
                color: annotation.color
              }}
            >
              {data.text}
            </div>
          );
        })}

      {visibleAnnotations
        .filter((annotation) => annotation.type === "blur")
        .map((annotation) => {
          const data = annotation.data as {
            x: number;
            y: number;
            w: number;
            h: number;
          };
          return (
            <div
              className="absolute rounded backdrop-blur-md"
              key={annotation.id}
              style={{
                left: `${data.x * 100}%`,
                top: `${data.y * 100}%`,
                width: `${data.w * 100}%`,
                height: `${data.h * 100}%`
              }}
            />
          );
        })}
    </div>
  );
}
