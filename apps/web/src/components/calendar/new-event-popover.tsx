"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type CalendarSource,
  type EventCategory
} from "@/components/calendar/calendar-data";
import { toISODate } from "@/lib/calendar-utils";

const DEFAULT_CATEGORY: EventCategory = "meeting";

export type NewEventInput = {
  title: string;
  date: string;
  time: string;
  location?: string;
  category: EventCategory;
  calendarId: string;
};

function pillClassName(active: boolean): string {
  return `rounded-lg px-2.5 py-1 text-xs font-semibold ${
    active
      ? "bg-[var(--fylmico-accent)] text-white"
      : "bg-black/[0.04] dark:bg-white/[0.06] text-[#4b5268] dark:text-[#c7cad9] hover:bg-black/[0.07] dark:hover:bg-white/[0.09]"
  }`;
}

export function NewEventPopover({
  calendarSources,
  defaultDate,
  onCreateEvent
}: {
  calendarSources: CalendarSource[];
  defaultDate: Date;
  onCreateEvent: (event: NewEventInput) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => toISODate(defaultDate));
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<EventCategory>(DEFAULT_CATEGORY);
  const [calendarId, setCalendarId] = useState(calendarSources[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);

    if (next) {
      setTitle("");
      setDate(toISODate(defaultDate));
      setTime("");
      setLocation("");
      setCategory(DEFAULT_CATEGORY);
      setCalendarId(calendarSources[0]?.id ?? "");
      setError(null);
    }
  }

  async function handleSubmit() {
    if (!title.trim() || !time.trim()) {
      setError("Title and time are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onCreateEvent({
        title: title.trim(),
        date,
        time: time.trim(),
        location: location.trim() || undefined,
        category,
        calendarId
      });
      setOpen(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not create this event."
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
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[var(--fylmico-accent)] to-[#5b3ff0] text-sm font-bold text-white hover:opacity-95"
            type="button"
          >
            <Plus className="h-4 w-4" />
            New Event
          </button>
        }
      />
      <PopoverContent align="center" className="w-80" side="top">
        <strong className="px-1 text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
          New Event
        </strong>

        <div className="grid gap-3 p-1">
          <div className="grid gap-1">
            <Label htmlFor="new-event-title">Title</Label>
            <Input
              id="new-event-title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Location Recce"
              value={title}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label>Date</Label>
              <DatePicker className="h-8" onChange={setDate} value={date} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="new-event-time">Time</Label>
              <Input
                id="new-event-time"
                onChange={(event) => setTime(event.target.value)}
                placeholder="e.g. 2:00 PM"
                value={time}
              />
            </div>
          </div>

          <div className="grid gap-1">
            <Label htmlFor="new-event-location">Location (optional)</Label>
            <Input
              id="new-event-location"
              onChange={(event) => setLocation(event.target.value)}
              placeholder="e.g. Studio A"
              value={location}
            />
          </div>

          <div className="grid gap-1">
            <Label>Event type</Label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_ORDER.map((option) => (
                <button
                  className={pillClassName(category === option)}
                  key={option}
                  onClick={() => setCategory(option)}
                  type="button"
                >
                  {CATEGORY_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-1">
            <Label>Calendar</Label>
            <div className="flex flex-wrap gap-1.5">
              {calendarSources.map((source) => (
                <button
                  className={pillClassName(calendarId === source.id)}
                  key={source.id}
                  onClick={() => setCalendarId(source.id)}
                  type="button"
                >
                  {source.name}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <p className="text-xs font-semibold text-red-600">{error}</p>
          ) : null}

          <button
            className="h-9 rounded-lg bg-gradient-to-br from-[var(--fylmico-accent)] to-[#5b3ff0] text-sm font-bold text-white hover:opacity-95 disabled:opacity-60"
            disabled={submitting}
            onClick={handleSubmit}
            type="button"
          >
            {submitting ? "Adding…" : "Add Event"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
