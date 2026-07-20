import { HousesGuideSection } from "@/components/houses/learn/houses-guide-section";
import { guideFeatures } from "@/components/houses/learn/houses-guide-data";

export function HousesGuideFeatures() {
  return (
    <HousesGuideSection
      eyebrow="Inside a house"
      subtitle="Every house comes with the same set of tools, ready as soon as you create it."
      title="What you can do inside a House"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guideFeatures.map((feature) => {
          const Icon = feature.icon;

          return (
            <article
              className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] dark:border-white/[0.08] dark:bg-[#171a28]"
              key={feature.id}
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--fylmico-accent)]/10 text-[var(--fylmico-accent)]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
                {feature.description}
              </p>
            </article>
          );
        })}
      </div>
    </HousesGuideSection>
  );
}
