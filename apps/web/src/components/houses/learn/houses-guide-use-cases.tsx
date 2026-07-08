import { Clapperboard } from "lucide-react";
import { HousesGuideSection } from "@/components/houses/learn/houses-guide-section";
import { guideUseCases } from "@/components/houses/learn/houses-guide-data";

export function HousesGuideUseCases() {
  return (
    <HousesGuideSection
      eyebrow="Who it's for"
      subtitle="Houses adapt to the size and shape of whatever you're making."
      title="Built for every kind of crew"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guideUseCases.map((useCase) => (
          <article
            className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]"
            key={useCase.title}
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Clapperboard className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-sm font-bold text-[#11142c]">
              {useCase.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#5f667d]">
              {useCase.description}
            </p>
          </article>
        ))}
      </div>
    </HousesGuideSection>
  );
}
