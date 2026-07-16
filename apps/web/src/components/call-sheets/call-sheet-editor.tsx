"use client";

import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type {
  CallSheet,
  CrewCallTime,
  CrewMember,
  Project,
  UpdateCallSheetRequest
} from "@/types/base";

const AUTOSAVE_DELAY_MS = 800;

export function CallSheetEditor({
  callSheet,
  projects,
  crew,
  onSave,
  onDelete
}: {
  callSheet: CallSheet;
  projects: Project[];
  crew: CrewMember[];
  onSave: (updates: UpdateCallSheetRequest) => Promise<void>;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(callSheet.title);
  const [projectId, setProjectId] = useState(callSheet.projectId ?? "");
  const [shootDate, setShootDate] = useState(callSheet.shootDate);
  const [generalCallTime, setGeneralCallTime] = useState(
    callSheet.generalCallTime
  );
  const [location, setLocation] = useState(callSheet.location ?? "");
  const [weather, setWeather] = useState(callSheet.weather ?? "");
  const [notes, setNotes] = useState(callSheet.notes ?? "");
  const [crewCallTimes, setCrewCallTimes] = useState<CrewCallTime[]>(
    callSheet.crewCallTimes
  );
  const [addingCrewId, setAddingCrewId] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function flushSave(updates: UpdateCallSheetRequest) {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
      saveTimeout.current = null;
    }
    setStatus("saving");
    try {
      await onSave(updates);
      setStatus("saved");
    } catch {
      setStatus("idle");
    }
  }

  function scheduleSave(updates: UpdateCallSheetRequest) {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    setStatus("saving");
    saveTimeout.current = setTimeout(async () => {
      try {
        await onSave(updates);
        setStatus("saved");
      } catch {
        setStatus("idle");
      }
    }, AUTOSAVE_DELAY_MS);
  }

  const availableCrew = crew.filter(
    (member) => !crewCallTimes.some((entry) => entry.userId === member.id)
  );

  function handleAddCrew() {
    const member = crew.find((candidate) => candidate.id === addingCrewId);
    if (!member) {
      return;
    }
    const nextEntries: CrewCallTime[] = [
      ...crewCallTimes,
      {
        userId: member.id,
        name: member.name,
        jobTitle: member.jobTitle,
        callTime: callSheet.generalCallTime
      }
    ];
    setCrewCallTimes(nextEntries);
    setAddingCrewId("");
    flushSave({ crewCallTimes: nextEntries });
  }

  function handleRemoveCrew(userId: string) {
    const nextEntries = crewCallTimes.filter(
      (entry) => entry.userId !== userId
    );
    setCrewCallTimes(nextEntries);
    flushSave({ crewCallTimes: nextEntries });
  }

  function handleCrewTimeChange(userId: string, callTime: string) {
    const nextEntries = crewCallTimes.map((entry) =>
      entry.userId === userId ? { ...entry, callTime } : entry
    );
    setCrewCallTimes(nextEntries);
    scheduleSave({ crewCallTimes: nextEntries });
  }

  return (
    <div className="grid min-h-0 gap-5 overflow-y-auto rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <input
          className="min-w-0 flex-1 bg-transparent text-xl font-black text-[#11142c] outline-none dark:text-[#f1f2f8]"
          onBlur={() => flushSave({ title })}
          onChange={(event) => {
            setTitle(event.target.value);
            scheduleSave({ title: event.target.value });
          }}
          value={title}
        />
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
            {status === "saving"
              ? "Saving..."
              : status === "saved"
                ? "Saved"
                : ""}
          </span>
          <button
            className="grid h-8 w-8 place-items-center rounded-lg text-[#8a90a3] transition hover:bg-red-50 hover:text-red-600 dark:text-[#7d8299] dark:hover:bg-red-500/10"
            onClick={onDelete}
            title="Delete call sheet"
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
            Project
          </span>
          <Select
            items={{
              none: "No project",
              ...Object.fromEntries(
                projects.map((project) => [project.id, project.title])
              )
            }}
            onValueChange={(next) => {
              const nextId = next && next !== "none" ? next : "";
              setProjectId(nextId);
              flushSave({ projectId: nextId || undefined });
            }}
            value={projectId || "none"}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No project</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
            Shoot date
          </span>
          <DatePicker
            className="h-9"
            onChange={(next) => {
              setShootDate(next);
              flushSave({ shootDate: next });
            }}
            value={shootDate}
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
            General call time
          </span>
          <input
            className="h-9 rounded-lg border border-black/10 bg-transparent px-2 text-sm text-[#11142c] outline-none focus:border-[#654cff] dark:border-white/10 dark:text-[#f1f2f8]"
            onBlur={() => flushSave({ generalCallTime })}
            onChange={(event) => {
              setGeneralCallTime(event.target.value);
              scheduleSave({ generalCallTime: event.target.value });
            }}
            value={generalCallTime}
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
            Location
          </span>
          <input
            className="h-9 rounded-lg border border-black/10 bg-transparent px-2 text-sm text-[#11142c] outline-none focus:border-[#654cff] dark:border-white/10 dark:text-[#f1f2f8]"
            onBlur={() => flushSave({ location })}
            onChange={(event) => {
              setLocation(event.target.value);
              scheduleSave({ location: event.target.value });
            }}
            value={location}
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
            Weather
          </span>
          <input
            className="h-9 rounded-lg border border-black/10 bg-transparent px-2 text-sm text-[#11142c] outline-none focus:border-[#654cff] dark:border-white/10 dark:text-[#f1f2f8]"
            onBlur={() => flushSave({ weather })}
            onChange={(event) => {
              setWeather(event.target.value);
              scheduleSave({ weather: event.target.value });
            }}
            placeholder="e.g. Clear, 68°F"
            value={weather}
          />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
          Notes
        </span>
        <textarea
          className="min-h-16 w-full resize-none rounded-lg border border-black/10 bg-transparent p-3 text-sm text-[#11142c] outline-none focus:border-[#654cff] dark:border-white/10 dark:text-[#f1f2f8]"
          onBlur={() => flushSave({ notes })}
          onChange={(event) => {
            setNotes(event.target.value);
            scheduleSave({ notes: event.target.value });
          }}
          placeholder="Parking instructions, safety notes, contact numbers..."
          value={notes}
        />
      </label>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <strong className="text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            Crew Call Times ({crewCallTimes.length})
          </strong>
          {availableCrew.length > 0 ? (
            <div className="flex items-center gap-2">
              <Select
                onValueChange={(next) => setAddingCrewId(next ?? "")}
                value={addingCrewId}
              >
                <SelectTrigger className="h-8" size="sm">
                  <SelectValue placeholder="Add crew member..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCrew.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                className="grid h-8 w-8 place-items-center rounded-lg bg-[#654cff]/10 text-[#654cff] hover:bg-[#654cff]/20 disabled:opacity-40"
                disabled={!addingCrewId}
                onClick={handleAddCrew}
                type="button"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>

        {crewCallTimes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-black/10 p-4 text-center text-sm text-[#8a90a3] dark:border-white/10 dark:text-[#7d8299]">
            No crew added yet. Use the dropdown above to add call times.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
            {crewCallTimes.map((entry) => (
              <div
                className="flex items-center gap-3 border-b border-black/5 px-3 py-2 last:border-b-0 dark:border-white/[0.06]"
                key={entry.userId}
              >
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                    {entry.name}
                  </strong>
                  <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
                    {entry.jobTitle}
                  </span>
                </div>
                <input
                  className="h-8 w-28 shrink-0 rounded-lg border border-black/10 bg-transparent px-2 text-sm text-[#11142c] outline-none focus:border-[#654cff] dark:border-white/10 dark:text-[#f1f2f8]"
                  onBlur={() => flushSave({ crewCallTimes })}
                  onChange={(event) =>
                    handleCrewTimeChange(entry.userId, event.target.value)
                  }
                  value={entry.callTime}
                />
                <button
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#8a90a3] hover:bg-red-50 hover:text-red-600 dark:text-[#7d8299] dark:hover:bg-red-500/10"
                  onClick={() => handleRemoveCrew(entry.userId)}
                  type="button"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
