import { HardDrive } from "lucide-react";
import { formatFileSize } from "@/components/files/file-data";

export function StorageUsedPanel({ usedBytes }: { usedBytes: number }) {
  return (
    <div className="shrink-0 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
      <div className="flex items-center gap-2 text-sm">
        <HardDrive className="h-4 w-4 text-[#8a90a3]" />
        <span className="font-semibold text-[#4b5268]">Storage Used</span>
      </div>
      <strong className="mt-1 block text-lg font-black text-[#11142c]">
        {formatFileSize(usedBytes) || "0 B"}
      </strong>
    </div>
  );
}
