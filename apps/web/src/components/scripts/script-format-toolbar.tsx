"use client";

export type ScriptElement =
  | "scene-heading"
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition";

const ELEMENT_META: Record<
  ScriptElement,
  { label: string; indent: number; upper: boolean }
> = {
  "scene-heading": { label: "Scene Heading", indent: 0, upper: true },
  action: { label: "Action", indent: 0, upper: false },
  character: { label: "Character", indent: 20, upper: true },
  dialogue: { label: "Dialogue", indent: 10, upper: false },
  parenthetical: { label: "Parenthetical", indent: 15, upper: false },
  transition: { label: "Transition", indent: 0, upper: true }
};

export function formatScriptLine(line: string, element: ScriptElement): string {
  const meta = ELEMENT_META[element];
  let trimmed = line.trim();

  if (element === "scene-heading") {
    trimmed = trimmed.toUpperCase();
    if (!/^(INT|EXT)[./]/.test(trimmed)) {
      trimmed = trimmed ? `INT. ${trimmed}` : "INT. ";
    }
  } else if (element === "parenthetical") {
    trimmed = trimmed.replace(/^\(|\)$/g, "");
    trimmed = trimmed ? `(${trimmed})` : "(";
  } else if (element === "transition") {
    trimmed = trimmed.toUpperCase();
    if (trimmed && !trimmed.endsWith(":")) {
      trimmed = `${trimmed}:`;
    }
  } else if (meta.upper) {
    trimmed = trimmed.toUpperCase();
  }

  return " ".repeat(meta.indent) + trimmed;
}

const ELEMENTS: ScriptElement[] = [
  "scene-heading",
  "action",
  "character",
  "dialogue",
  "parenthetical",
  "transition"
];

export function ScriptFormatToolbar({
  onApply
}: {
  onApply: (element: ScriptElement) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-black/5 pb-3 dark:border-white/[0.06]">
      {ELEMENTS.map((element) => (
        <button
          className="h-7 rounded-md border border-black/10 px-2.5 text-xs font-semibold text-[#4b5268] hover:bg-black/[0.04] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.06]"
          key={element}
          onClick={() => onApply(element)}
          title={`Format current line as ${ELEMENT_META[element].label}`}
          type="button"
        >
          {ELEMENT_META[element].label}
        </button>
      ))}
    </div>
  );
}
