"use client";

import { useState } from "react";
import {
  MessageSquare,
  Image as ImageIcon,
  MoreHorizontal,
  Paperclip,
  Pencil,
  StickyNote,
  X
} from "lucide-react";
import type { Shot, ShotType } from "@/components/storyboard/storyboard-data";
import { SHOT_TYPE_LABELS } from "@/components/storyboard/storyboard-data";
import { SHOT_TYPE_BADGE } from "@/components/storyboard/shot-type-meta";

const TOOLS = [
  { id: "draw", label: "Draw", icon: Pencil },
  { id: "note", label: "Note", icon: StickyNote },
  { id: "comment", label: "Comment", icon: MessageSquare },
  { id: "media", label: "Media", icon: ImageIcon }
];

export function ShotDetailPanel({
  shot,
  onClose,
  onUpdate
}: {
  shot: Shot;
  onClose: () => void;
  onUpdate: (updates: Partial<Shot>) => void;
}) {
  const [activeTool, setActiveTool] = useState("draw");
  const [tagDraft, setTagDraft] = useState("");
  const Icon = shot.icon;

  function addTag() {
    const value = tagDraft.trim();
    if (!value || shot.tags.includes(value)) {
      setTagDraft("");
      return;
    }
    onUpdate({ tags: [...shot.tags, value] });
    setTagDraft("");
  }

  function removeTag(tag: string) {
    onUpdate({ tags: shot.tags.filter((entry) => entry !== tag) });
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-black/[0.06] bg-white shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <strong className="text-sm font-black text-[#11142c]">
            Shot {shot.number}
          </strong>
          <span
            className={`rounded-md px-1.5 py-0.5 text-[0.65rem] font-bold text-white ${SHOT_TYPE_BADGE[shot.shotType]}`}
          >
            {shot.shotType}
          </span>
        </div>
        <button
          aria-label="Close shot details"
          className="grid h-7 w-7 place-items-center rounded-full text-[#8a90a3] hover:bg-black/[0.04]"
          onClick={onClose}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="flex h-40 items-center justify-center rounded-xl bg-gradient-to-b from-[#f4f4f8] to-[#e7e7ee]">
          <Icon className="h-14 w-14 text-[#8a90a3]/60" strokeWidth={1.1} />
        </div>

        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {TOOLS.map((tool) => {
            const ToolIcon = tool.icon;
            const active = activeTool === tool.id;

            return (
              <button
                className={`flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-semibold ${
                  active
                    ? "bg-[#654cff] text-white"
                    : "bg-black/[0.03] text-[#4b5268] hover:bg-black/[0.06]"
                }`}
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                type="button"
              >
                <ToolIcon className="h-4 w-4" />
                {tool.label}
              </button>
            );
          })}
        </div>
        <button
          className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-lg bg-black/[0.03] py-2 text-xs font-semibold text-[#4b5268] hover:bg-black/[0.06]"
          type="button"
        >
          <MoreHorizontal className="h-4 w-4" />
          More
        </button>

        <div className="mt-5">
          <strong className="text-sm font-bold text-[#11142c]">
            Shot Details
          </strong>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-bold text-[#8a90a3] uppercase">
                Duration
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-black/10 px-2.5">
                <input
                  className="h-9 w-full min-w-0 bg-transparent text-sm text-[#11142c] outline-none"
                  min={0}
                  onChange={(event) =>
                    onUpdate({ durationSec: Number(event.target.value) || 0 })
                  }
                  type="number"
                  value={shot.durationSec}
                />
                <span className="shrink-0 text-xs text-[#8a90a3]">sec</span>
              </div>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-[#8a90a3] uppercase">
                Camera
              </span>
              <select
                className="h-9 rounded-lg border border-black/10 px-2 text-sm text-[#11142c] outline-none"
                onChange={(event) =>
                  onUpdate({ shotType: event.target.value as ShotType })
                }
                value={shot.shotType}
              >
                {Object.entries(SHOT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label} ({value})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-3 grid gap-1">
            <span className="text-xs font-bold text-[#8a90a3] uppercase">
              Lens / Movement
            </span>
            <input
              className="h-9 rounded-lg border border-black/10 px-2.5 text-sm text-[#11142c] outline-none"
              onChange={(event) =>
                onUpdate({ lensMovement: event.target.value })
              }
              value={shot.lensMovement}
            />
          </label>

          <label className="mt-3 grid gap-1">
            <span className="text-xs font-bold text-[#8a90a3] uppercase">
              Description
            </span>
            <textarea
              className="min-h-[4.5rem] rounded-lg border border-black/10 p-2.5 text-sm text-[#11142c] outline-none"
              onChange={(event) =>
                onUpdate({ description: event.target.value })
              }
              value={shot.description}
            />
          </label>

          <div className="mt-3">
            <span className="text-xs font-bold text-[#8a90a3] uppercase">
              Tags
            </span>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {shot.tags.map((tag) => (
                <span
                  className="flex items-center gap-1 rounded-full bg-[#654cff]/10 px-2 py-1 text-xs font-bold text-[#654cff]"
                  key={tag}
                >
                  {tag}
                  <button
                    aria-label={`Remove ${tag} tag`}
                    onClick={() => removeTag(tag)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                className="h-7 w-20 rounded-full border border-dashed border-black/15 px-2 text-xs text-[#11142c] outline-none"
                onChange={(event) => setTagDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag();
                  }
                }}
                placeholder="+ Add"
                value={tagDraft}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8a90a3] uppercase">
                Attached Files ({shot.attachedFiles.length})
              </span>
              {shot.attachedFiles.length > 0 ? (
                <button
                  className="text-xs font-bold text-[#654cff]"
                  type="button"
                >
                  View all
                </button>
              ) : null}
            </div>
            <div className="mt-1.5 grid gap-1">
              {shot.attachedFiles.length > 0 ? (
                shot.attachedFiles.map((file) => (
                  <div
                    className="flex items-center gap-2.5 rounded-lg border border-black/[0.06] px-2.5 py-2"
                    key={file.name}
                  >
                    <Paperclip className="h-4 w-4 shrink-0 text-[#8a90a3]" />
                    <span className="min-w-0 flex-1 truncate text-sm text-[#3a3f57]">
                      {file.name}
                    </span>
                    <span className="shrink-0 text-xs text-[#8a90a3]">
                      {file.size}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#c3c7d4]">No files attached.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
