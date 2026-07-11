import { Clock } from "lucide-react";

export function ComingSoonNotice({ description }: { description: string }) {
  return (
    <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-black/10 bg-black/[0.015] px-6 py-10 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-[#654cff]/10 text-[#654cff]">
        <Clock className="h-5 w-5" />
      </span>
      <strong className="text-sm font-bold text-[#11142c]">Coming soon</strong>
      <p className="max-w-sm text-sm text-[#8a90a3]">{description}</p>
    </div>
  );
}
