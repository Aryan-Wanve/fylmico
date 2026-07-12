"use client";

import { Calendar } from "lucide-react";
import { useWorkspace } from "@/lib/workspace-context";

export function GreetingHeader() {
  const { workspace } = useWorkspace();
  const firstName = workspace.user.name.split(" ")[0];
  const greeting = getGreeting();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-black text-[#11142c] sm:text-3xl dark:text-[#f1f2f8]">
          {greeting}, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-[#5f667d] sm:text-base dark:text-[#a8acbf]">
          Here&apos;s what is happening with your productions today.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#4b5268] dark:border-white/10 dark:bg-[#171a28] dark:text-[#c7cad9]">
        <Calendar className="h-4 w-4 text-[#8a90a3] dark:text-[#7d8299]" />
        {today}
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}
