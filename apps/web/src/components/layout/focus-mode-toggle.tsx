"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { getFocusMode, setFocusMode } from "@/lib/focus-mode";

export function FocusModeToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a localStorage-backed toggle on mount, not deriving render output
    setEnabled(getFocusMode());
  }, []);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-black/[0.03] p-3 dark:bg-white/[0.04]">
      <div className="min-w-0">
        <strong className="block text-xs font-bold text-[#11142c] dark:text-[#f1f2f8]">
          Focus Mode
        </strong>
        <span className="text-xs text-[#8a90a3] dark:text-[#7d8299]">
          Hide distractions. Stay in flow.
        </span>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={(checked: boolean) => {
          setEnabled(checked);
          setFocusMode(checked);
        }}
      />
    </div>
  );
}
