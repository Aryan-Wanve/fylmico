const WEEK_LENGTH = 7;

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function addDays(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
}

/** Returns the Monday-start week (7 days) containing `date`. */
export function getWeekDays(date: Date): Date[] {
  const mondayOffset = (date.getDay() + 6) % 7;
  const monday = addDays(date, -mondayOffset);
  return Array.from({ length: WEEK_LENGTH }, (_, index) =>
    addDays(monday, index)
  );
}

export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/**
 * Returns Monday-start weeks covering every day of `monthCursor`'s month,
 * padded with the leading/trailing days needed to fill full weeks.
 */
export function getMonthGrid(monthCursor: Date): Date[][] {
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  const leadingOffset = (firstOfMonth.getDay() + 6) % 7;
  const trailingOffset = (7 - ((lastOfMonth.getDay() + 6) % 7) - 1) % 7;
  const totalDays = leadingOffset + lastOfMonth.getDate() + trailingOffset;

  const days: Date[] = [];

  for (let i = 0; i < totalDays; i++) {
    days.push(new Date(year, month, 1 - leadingOffset + i));
  }

  const weeks: Date[][] = [];

  for (let i = 0; i < days.length; i += WEEK_LENGTH) {
    weeks.push(days.slice(i, i + WEEK_LENGTH));
  }

  return weeks;
}
