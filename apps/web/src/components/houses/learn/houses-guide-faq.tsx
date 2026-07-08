import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger
} from "@/components/ui/accordion";
import { HousesGuideSection } from "@/components/houses/learn/houses-guide-section";
import { guideFaqs } from "@/components/houses/learn/houses-guide-data";

export function HousesGuideFaq() {
  return (
    <HousesGuideSection eyebrow="FAQ" title="Common questions">
      <div className="rounded-2xl border border-black/[0.06] bg-white px-5 shadow-[0_1rem_3rem_rgba(53,45,124,0.05)]">
        <Accordion multiple>
          {guideFaqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionPanel>{faq.answer}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </HousesGuideSection>
  );
}
