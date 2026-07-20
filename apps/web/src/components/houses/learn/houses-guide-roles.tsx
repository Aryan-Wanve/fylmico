import { HousesGuideSection } from "@/components/houses/learn/houses-guide-section";
import { guideRoles } from "@/components/houses/learn/houses-guide-data";

export function HousesGuideRoles() {
  return (
    <HousesGuideSection
      eyebrow="Roles & permissions"
      subtitle="Every member gets a role that shapes what they can see and do — assign as many as you need, per house."
      title="Everyone has a place on the crew"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {guideRoles.map((role) => (
          <div
            className="flex items-start gap-3 rounded-xl border border-black/[0.06] bg-white px-4 py-3.5 dark:border-white/[0.08] dark:bg-[#171a28]"
            key={role.name}
          >
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[var(--fylmico-accent)]" />
            <div>
              <strong className="block text-sm font-bold text-[#11142c] dark:text-[#f1f2f8]">
                {role.name}
              </strong>
              <p className="mt-0.5 text-sm leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
                {role.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </HousesGuideSection>
  );
}
