import { LayoutTemplate } from "lucide-react";
import type { BoardTemplate } from "@/components/storyboard/storyboard-data";

export function TemplatesGrid({
  templates,
  onUseTemplate
}: {
  templates: BoardTemplate[];
  onUseTemplate: (template: BoardTemplate) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => (
        <article
          className="flex flex-col rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]"
          key={template.id}
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <LayoutTemplate className="h-5 w-5" />
          </span>
          <strong className="mt-3 text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
            {template.name}
          </strong>
          <p className="mt-1 flex-1 text-sm leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
            {template.description}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
              {template.frameCount} frames
            </span>
            <button
              className="text-sm font-bold text-[var(--fylmico-accent)]"
              onClick={() => onUseTemplate(template)}
              type="button"
            >
              Use Template
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
