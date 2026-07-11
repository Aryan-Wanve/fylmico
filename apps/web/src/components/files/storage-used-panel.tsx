import { HardDrive } from "lucide-react";
import { storageBreakdown, storageTotalGb } from "@/components/files/file-data";

export function StorageUsedPanel() {
  const usedGb = storageBreakdown.reduce((sum, entry) => sum + entry.sizeGb, 0);
  const percent = Math.round((usedGb / storageTotalGb) * 100);

  return (
    <div className="shrink-0 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-[#4b5268]">Storage Used</span>
        <span className="font-bold text-[#11142c]">{usedGb} GB / 1 TB</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className="h-full rounded-full bg-[#654cff]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <button
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#654cff] py-2.5 text-sm font-bold text-white hover:bg-[#5a41ea]"
        type="button"
      >
        <HardDrive className="h-4 w-4" />
        Upgrade Storage
      </button>
    </div>
  );
}
