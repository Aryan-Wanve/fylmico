import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  STATUS_COLOR_HEX,
  STATUS_META,
  STATUS_ORDER,
  type Task
} from "@/components/tasks/task-data";

const RADIUS = 52;
const STROKE_WIDTH = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TaskOverviewPanel({ tasks }: { tasks: Task[] }) {
  const total = tasks.length;
  const segments = STATUS_ORDER.map((status) => ({
    status,
    count: tasks.filter((task) => task.status === status).length
  }));

  let cumulative = 0;

  return (
    <DashboardPanel title="Overview">
      <div className="flex items-center gap-6 p-5">
        <div className="relative h-32 w-32 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              fill="none"
              r={RADIUS}
              stroke="#f1f1f6"
              strokeWidth={STROKE_WIDTH}
            />
            {total > 0
              ? segments.map(({ status, count }) => {
                  if (count === 0) {
                    return null;
                  }

                  const dash = (count / total) * CIRCUMFERENCE;
                  const offset = cumulative;
                  cumulative += dash;

                  return (
                    <circle
                      cx="60"
                      cy="60"
                      fill="none"
                      key={status}
                      r={RADIUS}
                      stroke={STATUS_COLOR_HEX[status]}
                      strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                      strokeDashoffset={-offset}
                      strokeWidth={STROKE_WIDTH}
                    />
                  );
                })
              : null}
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <strong className="block text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
                {total}
              </strong>
              <span className="text-[0.65rem] font-semibold text-[#667085] dark:text-[#7d8299]">
                Total Tasks
              </span>
            </div>
          </div>
        </div>

        <div className="grid flex-1 gap-2.5">
          {segments.map(({ status, count }) => (
            <div
              className="flex items-center justify-between gap-2 text-sm"
              key={status}
            >
              <span className="flex items-center gap-2 font-semibold text-[#4b5268] dark:text-[#c7cad9]">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${STATUS_META[status].dot}`}
                />
                {STATUS_META[status].label}
              </span>
              <span className="font-bold text-[#11142c] dark:text-[#f1f2f8]">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardPanel>
  );
}
