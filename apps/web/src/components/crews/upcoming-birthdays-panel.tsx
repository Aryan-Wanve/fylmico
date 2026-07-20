import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, type CrewMember } from "@/components/crews/crew-data";

function daysUntilBirthday(birthday: string, today: Date): number {
  const [month, day] = birthday.split("-").map(Number);
  let next = new Date(today.getFullYear(), month - 1, day);
  next.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setHours(0, 0, 0, 0);

  if (next.getTime() < start.getTime()) {
    next = new Date(today.getFullYear() + 1, month - 1, day);
  }

  return Math.round((next.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
}

export function UpcomingBirthdaysPanel({ members }: { members: CrewMember[] }) {
  const today = new Date();

  const upcoming = members
    .filter((member): member is CrewMember & { birthday: string } =>
      Boolean(member.birthday)
    )
    .map((member) => ({
      member,
      daysAway: daysUntilBirthday(member.birthday, today)
    }))
    .sort((a, b) => a.daysAway - b.daysAway)
    .slice(0, 4);

  return (
    <DashboardPanel title="Upcoming Birthdays">
      <div className="grid grid-cols-1">
        {upcoming.length > 0 ? (
          upcoming.map(({ member }) => {
            const [month, day] = member.birthday.split("-").map(Number);
            const monthLabel = new Date(2000, month - 1, 1).toLocaleDateString(
              "en-US",
              { month: "short" }
            );
            return (
              <div
                className="flex items-center gap-3 border-b border-black/5 px-6 py-3.5 last:border-b-0 dark:border-white/[0.06]"
                key={member.id}
              >
                <Avatar>
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-semibold text-[#11142c] dark:text-[#f1f2f8]">
                    {member.name}
                  </strong>
                  <span className="text-xs text-[#667085] dark:text-[#7d8299]">
                    {member.jobTitle}
                  </span>
                </div>
                <span className="grid shrink-0 place-items-center rounded-lg bg-[var(--fylmico-accent)]/[0.08] px-2.5 py-1 text-center">
                  <span className="text-[0.65rem] font-bold text-[var(--fylmico-accent)] uppercase">
                    {monthLabel}
                  </span>
                  <span className="text-sm font-black text-[var(--fylmico-accent)]">
                    {day}
                  </span>
                </span>
              </div>
            );
          })
        ) : (
          <p className="px-6 py-6 text-center text-sm text-[#667085] dark:text-[#7d8299]">
            No birthdays coming up.
          </p>
        )}
      </div>
    </DashboardPanel>
  );
}
