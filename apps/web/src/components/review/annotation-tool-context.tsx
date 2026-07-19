"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export const ANNOTATION_TOOLS = [
  "arrow",
  "rectangle",
  "circle",
  "freehand",
  "line",
  "highlight",
  "text",
  "blur"
] as const;
export type AnnotationTool = (typeof ANNOTATION_TOOLS)[number];

export const ANNOTATION_COLORS = [
  "#ff5c5c",
  "#ffb020",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#f8fafc"
];

interface AnnotationToolContextValue {
  activeTool: AnnotationTool | null;
  setActiveTool: (tool: AnnotationTool | null) => void;
  color: string;
  setColor: (color: string) => void;
}

const AnnotationToolContext = createContext<AnnotationToolContextValue | null>(
  null
);

export function AnnotationToolProvider({ children }: { children: ReactNode }) {
  const [activeTool, setActiveTool] = useState<AnnotationTool | null>(null);
  const [color, setColor] = useState(ANNOTATION_COLORS[0]);

  return (
    <AnnotationToolContext.Provider
      value={{ activeTool, setActiveTool, color, setColor }}
    >
      {children}
    </AnnotationToolContext.Provider>
  );
}

export function useAnnotationTool(): AnnotationToolContextValue {
  const context = useContext(AnnotationToolContext);
  if (!context) {
    throw new Error(
      "useAnnotationTool must be used within an AnnotationToolProvider"
    );
  }
  return context;
}
