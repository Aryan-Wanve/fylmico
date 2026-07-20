export type TaskProgressStage = {
  label: string;
  state: "done" | "active" | "pending";
};

export function TaskProgressTracker({
  stages
}: {
  stages: TaskProgressStage[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-3">
      {stages.map((stage, index) => (
        <div className="flex items-center" key={stage.label}>
          <div className="grid place-items-center gap-1.5 text-center">
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-[0.65rem] font-bold ${
                stage.state === "done"
                  ? "bg-[#16c784] text-white"
                  : stage.state === "active"
                    ? "bg-[var(--fylmico-accent)] text-white"
                    : "bg-black/[0.06] text-[#667085] dark:bg-white/[0.08] dark:text-[#878ca0]"
              }`}
            >
              {stage.state === "done" ? "✓" : index + 1}
            </span>
            <span
              className={`w-[5.5rem] text-[0.65rem] leading-tight font-semibold ${
                stage.state === "pending"
                  ? "text-[#667085] dark:text-[#878ca0]"
                  : "text-[#11142c] dark:text-[#f1f2f8]"
              }`}
            >
              {stage.label}
            </span>
          </div>
          {index < stages.length - 1 ? (
            <span
              className={`mb-4 h-0.5 w-6 shrink-0 sm:w-10 ${
                stage.state === "done"
                  ? "bg-[#16c784]"
                  : "bg-black/[0.08] dark:bg-white/[0.1]"
              }`}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
