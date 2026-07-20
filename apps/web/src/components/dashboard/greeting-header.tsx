"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { useWorkspace } from "@/lib/workspace-context";

export function GreetingHeader() {
  const { workspace, activeHouse } = useWorkspace();
  const firstName = workspace.user.name.split(" ")[0];
  const greeting = getGreeting();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const today = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-black text-[#11142c] sm:text-3xl dark:text-[#f1f2f8]">
          {greeting}, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-[#5f667d] sm:text-base dark:text-[#a8acbf]">
          {activeHouse?.myRole ?? "Member"} · {activeHouse?.name ?? "Fylmico"}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#4b5268] dark:border-white/10 dark:bg-[#171a28] dark:text-[#c7cad9]">
          <Clock className="h-4 w-4 text-[#667085] dark:text-[#878ca0]" />
          {today}, {time}
        </div>
        <WeatherWidget />
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
