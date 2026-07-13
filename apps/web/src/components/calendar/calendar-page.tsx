"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarMonthGrid } from "@/components/calendar/calendar-month-grid";
import { CalendarWeekGrid } from "@/components/calendar/calendar-week-grid";
import { CalendarDayGrid } from "@/components/calendar/calendar-day-grid";
import { CalendarLegend } from "@/components/calendar/calendar-legend";
import { MiniCalendar } from "@/components/calendar/mini-calendar";
import { CalendarsPanel } from "@/components/calendar/calendars-panel";
import { UpcomingEventsPanel } from "@/components/calendar/upcoming-events-panel";
import {
  NewEventPopover,
  type NewEventInput
} from "@/components/calendar/new-event-popover";
import {
  buildCalendarSources,
  MY_SCHEDULE_ID,
  toCalendarEvent,
  type CalendarEvent,
  type EventCategory
} from "@/components/calendar/calendar-data";
import { addDays, addMonths, isSameMonth } from "@/lib/calendar-utils";
import {
  createCalendarEvent,
  listCalendarEvents,
  listProjects
} from "@/services/base-workspace.service";
import type { Project } from "@/types/base";

type ViewMode = "month" | "week" | "day";

const ALL_CATEGORIES: EventCategory[] = [
  "shoot",
  "post-production",
  "meeting",
  "pre-production",
  "delivery",
  "other"
];

function toggleSetValue<T>(current: Set<T>, value: T): Set<T> {
  const next = new Set(current);

  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }

  return next;
}

export function CalendarPage() {
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [inactiveCalendarIds, setInactiveCalendarIds] = useState<Set<string>>(
    () => new Set()
  );
  const [activeCategories, setActiveCategories] = useState(
    () => new Set<EventCategory>(ALL_CATEGORIES)
  );

  const calendarSources = useMemo(
    () => buildCalendarSources(projects),
    [projects]
  );

  const activeCalendarIds = useMemo(
    () =>
      new Set(
        calendarSources
          .map((source) => source.id)
          .filter((id) => !inactiveCalendarIds.has(id))
      ),
    [calendarSources, inactiveCalendarIds]
  );

  useEffect(() => {
    let cancelled = false;

    Promise.all([listProjects(), listCalendarEvents()])
      .then(([projectsData, eventsData]) => {
        if (cancelled) {
          return;
        }
        setProjects(projectsData);
        setEvents(eventsData.map(toCalendarEvent));
      })
      .catch((error) => {
        if (!cancelled) {
          window.alert(
            error instanceof Error
              ? error.message
              : "Could not load the calendar."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSelectDate(date: Date) {
    setSelectedDate(date);

    if (!isSameMonth(date, visibleMonth)) {
      setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }

  async function handleCreateEvent(input: NewEventInput) {
    const created = await createCalendarEvent({
      title: input.title,
      date: input.date,
      time: input.time,
      location: input.location || undefined,
      category: input.category,
      projectId:
        input.calendarId === MY_SCHEDULE_ID ? undefined : input.calendarId
    });

    const event = toCalendarEvent(created);
    setEvents((current) => [...current, event]);
    setActiveCategories((current) => new Set(current).add(event.category));
    setInactiveCalendarIds((current) => {
      const next = new Set(current);
      next.delete(event.calendarId);
      return next;
    });
    handleSelectDate(new Date(`${event.date}T00:00:00`));
  }

  function handleToday() {
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  }

  function handlePrevMonth() {
    setVisibleMonth((month) => addMonths(month, -1));
  }

  function handleNextMonth() {
    setVisibleMonth((month) => addMonths(month, 1));
  }

  function handlePrevWeek() {
    handleSelectDate(addDays(selectedDate, -7));
  }

  function handleNextWeek() {
    handleSelectDate(addDays(selectedDate, 7));
  }

  function handlePrevDay() {
    handleSelectDate(addDays(selectedDate, -1));
  }

  function handleNextDay() {
    handleSelectDate(addDays(selectedDate, 1));
  }

  const filteredEvents = events.filter(
    (event) =>
      activeCalendarIds.has(event.calendarId) &&
      activeCategories.has(event.category)
  );

  return (
    <Tabs
      className="min-w-0"
      onValueChange={(value) => setViewMode(value as ViewMode)}
      value={viewMode}
    >
      <div className="grid grid-cols-1 gap-6 p-8 xl:grid-cols-[1fr_22rem]">
        <div className="grid min-w-0 grid-cols-1 gap-4">
          <CalendarHeader
            activeCategories={activeCategories}
            onNextMonth={handleNextMonth}
            onPrevMonth={handlePrevMonth}
            onSelectMonth={setVisibleMonth}
            onToday={handleToday}
            onToggleCategory={(category) =>
              setActiveCategories((current) =>
                toggleSetValue(current, category)
              )
            }
            visibleMonth={visibleMonth}
          />

          <TabsContent className="min-w-0" value="month">
            <div className="grid min-w-0 grid-cols-1 gap-3">
              <CalendarMonthGrid
                events={filteredEvents}
                onSelectDate={handleSelectDate}
                selectedDate={selectedDate}
                visibleMonth={visibleMonth}
              />
              <CalendarLegend />
            </div>
          </TabsContent>
          <TabsContent className="min-w-0" value="week">
            <CalendarWeekGrid
              anchorDate={selectedDate}
              events={filteredEvents}
              onNextWeek={handleNextWeek}
              onPrevWeek={handlePrevWeek}
              onSelectDate={handleSelectDate}
              selectedDate={selectedDate}
            />
          </TabsContent>
          <TabsContent className="min-w-0" value="day">
            <CalendarDayGrid
              events={filteredEvents}
              onNextDay={handleNextDay}
              onPrevDay={handlePrevDay}
              selectedDate={selectedDate}
            />
          </TabsContent>
        </div>

        <aside className="grid min-w-0 grid-cols-1 content-start gap-6">
          <MiniCalendar
            eventDateSet={new Set(filteredEvents.map((event) => event.date))}
            onNextMonth={handleNextMonth}
            onPrevMonth={handlePrevMonth}
            onSelectDate={handleSelectDate}
            selectedDate={selectedDate}
            visibleMonth={visibleMonth}
          />
          <CalendarsPanel
            activeCalendarIds={activeCalendarIds}
            calendarSources={calendarSources}
            onToggleCalendar={(calendarId) =>
              setInactiveCalendarIds((current) =>
                toggleSetValue(current, calendarId)
              )
            }
          />
          <UpcomingEventsPanel events={filteredEvents} />
          <NewEventPopover
            calendarSources={calendarSources}
            defaultDate={selectedDate}
            onCreateEvent={handleCreateEvent}
          />
        </aside>
      </div>
    </Tabs>
  );
}
