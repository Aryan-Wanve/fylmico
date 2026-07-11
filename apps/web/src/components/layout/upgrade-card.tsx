"use client";

import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UpgradeCard() {
  const router = useRouter();

  return (
    <div className="grid gap-2 rounded-2xl border border-[#654cff]/15 bg-gradient-to-br from-[#654cff]/10 to-[#654cff]/5 p-4">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#654cff]/15 text-[#654cff]">
        <Crown className="h-[1.1rem] w-[1.1rem]" />
      </div>
      <strong className="text-sm font-bold text-[#12142b] dark:text-[#f1f2f8]">
        Upgrade to Pro
      </strong>
      <p className="text-xs leading-snug text-[#5f667d] dark:text-[#a8acbf]">
        Unlock advanced features and more storage.
      </p>
      <Button
        className="h-9 rounded-lg bg-[#654cff] text-sm font-bold text-white hover:bg-[#5b3ff0]"
        onClick={() => router.push("/settings?section=billing")}
        type="button"
      >
        Upgrade Now
      </Button>
    </div>
  );
}
