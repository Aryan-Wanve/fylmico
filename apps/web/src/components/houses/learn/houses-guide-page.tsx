import { HousesGuideHeader } from "@/components/houses/learn/houses-guide-header";
import { HousesGuideHero } from "@/components/houses/learn/houses-guide-hero";
import { HousesGuideFeatures } from "@/components/houses/learn/houses-guide-features";
import { HousesGuideRoles } from "@/components/houses/learn/houses-guide-roles";
import { HousesGuideUseCases } from "@/components/houses/learn/houses-guide-use-cases";
import { HousesGuideFaq } from "@/components/houses/learn/houses-guide-faq";
import { HousesGuideCta } from "@/components/houses/learn/houses-guide-cta";

export function HousesGuidePage() {
  return (
    <main className="min-h-screen bg-[#f7f7fb]">
      <HousesGuideHeader />
      <HousesGuideHero />
      <HousesGuideFeatures />
      <HousesGuideRoles />
      <HousesGuideUseCases />
      <HousesGuideFaq />
      <HousesGuideCta />
    </main>
  );
}
