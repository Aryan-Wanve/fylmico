"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toISODate } from "@/lib/calendar-utils";
import type { Project, TimeEntryPhase } from "@/types/base";

const PHASES: TimeEntryPhase[] = [
  "Pre-Production",
  "Production",
  "Post-Production",
  "Planning"
];

const NO_PROJECT_ID = "";

export type LogTimeInput = {
  date: string;
  hours: number;
  phase: TimeEntryPhase;
  projectId?: string;
};

function pillClassName(active: boolean): string {
  return `rounded-lg px-2.5 py-1 text-xs font-semibold ${
    active
      ? "bg-[#654cff] text-white"
      : "bg-black/[0.04] dark:bg-white/[0.06] text-[#4b5268] dark:text-[#c7cad9] hover:bg-black/[0.07] dark:hover:bg-white/[0.09]"
  }`;
}

export function LogTimePopover({
  projects,
  onLogTime
}: {
  projects: Project[];
  onLogTime: (input: LogTimeInput) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => toISODate(new Date()));
  const [hours, setHours] = useState("");
  const [phase, setPhase] = useState<TimeEntryPhase>("Production");
  const [projectId, setProjectId] = useState<string>(NO_PROJECT_ID);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);

    if (next) {
      setDate(toISODate(new Date()));
      setHours("");
      setPhase("Production");
      setProjectId(NO_PROJECT_ID);
      setError(null);
    }
  }

  async function handleSubmit() {
    const parsedHours = Number(hours);

    if (!date.trim() || !hours.trim() || !(parsedHours > 0)) {
      setError("Date and a positive number of hours are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onLogTime({
        date,
        hours: parsedHours,
        phase,
        projectId: projectId || undefined
      });
      setOpen(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not log this time entry."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger
        render={
          <button
            className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:bg-[#171a28] dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
            type="button"
          >
            <Clock className="h-4 w-4" />
            Log Time
          </button>
        }
      />
      <PopoverContent align="end" className="w-80" side="bottom">
        <strong className="px-1 text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          Log Time
        </strong>

        <div className="grid gap-3 p-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label htmlFor="log-time-date">Date</Label>
              <Input
                id="log-time-date"
                onChange={(event) => setDate(event.target.value)}
                type="date"
                value={date}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="log-time-hours">Hours</Label>
              <Input
                id="log-time-hours"
                min="0"
                onChange={(event) => setHours(event.target.value)}
                placeholder="e.g. 2.5"
                step="0.25"
                type="number"
                value={hours}
              />
            </div>
          </div>

          <div className="grid gap-1">
            <Label>Phase</Label>
            <div className="flex flex-wrap gap-1.5">
              {PHASES.map((option) => (
                <button
                  className={pillClassName(phase === option)}
                  key={option}
                  onClick={() => setPhase(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {projects.length > 0 ? (
            <div className="grid gap-1">
              <Label>Project (optional)</Label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  className={pillClassName(projectId === NO_PROJECT_ID)}
                  onClick={() => setProjectId(NO_PROJECT_ID)}
                  type="button"
                >
                  None
                </button>
                {projects.map((project) => (
                  <button
                    className={pillClassName(projectId === project.id)}
                    key={project.id}
                    onClick={() => setProjectId(project.id)}
                    type="button"
                  >
                    {project.title}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="text-xs font-semibold text-red-600">{error}</p>
          ) : null}

          <button
            className="h-9 rounded-lg bg-gradient-to-br from-[#654cff] to-[#5b3ff0] text-sm font-bold text-white hover:opacity-95 disabled:opacity-60"
            disabled={submitting}
            onClick={handleSubmit}
            type="button"
          >
            {submitting ? "Logging…" : "Log Time"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
