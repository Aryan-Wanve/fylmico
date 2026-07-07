"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  calendarSources,
  type CalendarEvent,
  type EventCategory
} from "@/components/calendar/calendar-data";
import { toISODate } from "@/lib/calendar-utils";

const DEFAULT_CATEGORY: EventCategory = "meeting";

function pillClassName(active: boolean): string {
  return `rounded-lg px-2.5 py-1 text-xs font-semibold ${
    active
      ? "bg-[#654cff] text-white"
      : "bg-black/[0.04] text-[#4b5268] hover:bg-black/[0.07]"
  }`;
}

export function NewEventPopover({
  defaultDate,
  onCreateEvent
}: {
  defaultDate: Date;
  onCreateEvent: (event: CalendarEvent) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => toISODate(defaultDate));
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<EventCategory>(DEFAULT_CATEGORY);
  const [calendarId, setCalendarId] = useState(calendarSources[0].id);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);

    if (next) {
      setTitle("");
      setDate(toISODate(defaultDate));
      setTime("");
      setLocation("");
      setCategory(DEFAULT_CATEGORY);
      setCalendarId(calendarSources[0].id);
      setError(null);
    }
  }

  function handleSubmit() {
    if (!title.trim() || !time.trim()) {
      setError("Title and time are required.");
      return;
    }

    onCreateEvent({
      id: `event-${Date.now()}`,
      title: title.trim(),
      date,
      time: time.trim(),
      location: location.trim() || undefined,
      category,
      calendarId
    });

    setOpen(false);
  }

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger
        render={
          <button
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#654cff] to-[#5b3ff0] text-sm font-bold text-white hover:opacity-95"
            type="button"
          >
            <Plus className="h-4 w-4" />
            New Event
          </button>
        }
      />
      <PopoverContent align="center" className="w-80" side="top">
        <strong className="px-1 text-sm font-bold text-[#11142c]">
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
              <Label htmlFor="new-event-date">Date</Label>
              <Input
                id="new-event-date"
                onChange={(event) => setDate(event.target.value)}
                type="date"
                value={date}
              />
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
            className="h-9 rounded-lg bg-gradient-to-br from-[#654cff] to-[#5b3ff0] text-sm font-bold text-white hover:opacity-95"
            onClick={handleSubmit}
            type="button"
          >
            Add Event
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
