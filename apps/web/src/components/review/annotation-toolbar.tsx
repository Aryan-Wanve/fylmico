"use client";

import {
  ArrowUpRight,
  Circle,
  Eraser,
  Highlighter,
  Minus,
  MousePointer2,
  PenTool,
  Square,
  Type,
  type LucideIcon
} from "lucide-react";
import {
  ANNOTATION_COLORS,
  ANNOTATION_TOOLS,
  useAnnotationTool,
  type AnnotationTool
} from "./annotation-tool-context";

const TOOL_META: Record<AnnotationTool, { label: string; icon: LucideIcon }> = {
  arrow: { label: "Arrow", icon: ArrowUpRight },
  rectangle: { label: "Rectangle", icon: Square },
  circle: { label: "Circle", icon: Circle },
  freehand: { label: "Freehand", icon: PenTool },
  line: { label: "Line", icon: Minus },
  highlight: { label: "Highlight", icon: Highlighter },
  text: { label: "Text", icon: Type },
  blur: { label: "Blur", icon: Eraser }
};

export function AnnotationToolbar({ disabled }: { disabled?: boolean }) {
  const { activeTool, setActiveTool, color, setColor } = useAnnotationTool();

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-[#11142c] px-2 py-1.5">
      <button
        aria-label="Select / pan"
        aria-pressed={activeTool === null}
        className={`grid h-8 w-8 place-items-center rounded-lg ${
          activeTool === null
            ? "bg-[#654cff] text-white"
            : "text-white/60 hover:bg-white/10 hover:text-white"
        }`}
        onClick={() => setActiveTool(null)}
        type="button"
      >
        <MousePointer2 className="h-4 w-4" />
      </button>

      <div className="mx-1 h-5 w-px bg-white/10" />

      {ANNOTATION_TOOLS.map((tool) => {
        const meta = TOOL_META[tool];
        const Icon = meta.icon;
        return (
          <button
            aria-label={meta.label}
            aria-pressed={activeTool === tool}
            className={`grid h-8 w-8 place-items-center rounded-lg disabled:cursor-not-allowed disabled:opacity-30 ${
              activeTool === tool
                ? "bg-[#654cff] text-white"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
            disabled={disabled}
            key={tool}
            onClick={() => setActiveTool(activeTool === tool ? null : tool)}
            title={meta.label}
            type="button"
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}

      <div className="mx-1 h-5 w-px bg-white/10" />

      <div className="flex items-center gap-1">
        {ANNOTATION_COLORS.map((swatch) => (
          <button
            aria-label={`Color ${swatch}`}
            aria-pressed={color === swatch}
            className={`h-5 w-5 rounded-full border-2 ${
              color === swatch ? "border-white" : "border-transparent"
            }`}
            key={swatch}
            onClick={() => setColor(swatch)}
            style={{ backgroundColor: swatch }}
            type="button"
          />
        ))}
      </div>

      {disabled ? (
        <span className="ml-1 text-[11px] text-white/40">
          Pause the video to annotate
        </span>
      ) : null}
    </div>
  );
}
