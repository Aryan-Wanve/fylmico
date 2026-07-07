"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarMonthGrid } from "@/components/calendar/calendar-month-grid";
import { CalendarLegend } from "@/components/calendar/calendar-legend";
import { CalendarEmptyView } from "@/components/calendar/calendar-empty-view";
import { MiniCalendar } from "@/components/calendar/mini-calendar";
import { CalendarsPanel } from "@/components/calendar/calendars-panel";
import { UpcomingEventsPanel } from "@/components/calendar/upcoming-events-panel";
import { NewEventPopover } from "@/components/calendar/new-event-popover";
import {
  calendarEvents,
  calendarSources,
  type CalendarEvent,
  type EventCategory
} from "@/components/calendar/calendar-data";
import { addMonths, isSameMonth } from "@/lib/calendar-utils";

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
  const [events, setEvents] = useState<CalendarEvent[]>(() => calendarEvents);
  const [activeCalendarIds, setActiveCalendarIds] = useState(
    () => new Set(calendarSources.map((source) => source.id))
  );
  const [activeCategories, setActiveCategories] = useState(
    () => new Set<EventCategory>(ALL_CATEGORIES)
  );

  function handleSelectDate(date: Date) {
    setSelectedDate(date);

    if (!isSameMonth(date, visibleMonth)) {
      setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }

  function handleCreateEvent(event: CalendarEvent) {
    setEvents((current) => [...current, event]);
    setActiveCategories((current) => new Set(current).add(event.category));
    setActiveCalendarIds((current) => new Set(current).add(event.calendarId));
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
      <div className="grid gap-6 p-8 xl:grid-cols-[1fr_22rem]">
        <div className="grid min-w-0 gap-4">
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
            <div className="grid min-w-0 gap-3">
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
            <CalendarEmptyView label="Week" />
          </TabsContent>
          <TabsContent className="min-w-0" value="day">
            <CalendarEmptyView label="Day" />
          </TabsContent>
        </div>

        <aside className="grid min-w-0 content-start gap-6">
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
            onToggleCalendar={(calendarId) =>
              setActiveCalendarIds((current) =>
                toggleSetValue(current, calendarId)
              )
            }
          />
          <UpcomingEventsPanel events={filteredEvents} />
          <NewEventPopover
            defaultDate={selectedDate}
            onCreateEvent={handleCreateEvent}
          />
        </aside>
      </div>
    </Tabs>
  );
}
