import { Plus, UserRoundPlus, Users } from "lucide-react";
import { HouseChoiceRow } from "@/components/houses/house-choice-row";

export function HouseChoiceCard({
  isSubmitting,
  onCreateHouse,
  onJoinHouse
}: {
  isSubmitting: boolean;
  onCreateHouse: () => void;
  onJoinHouse: () => void;
}) {
  return (
    <section className="w-full max-w-[30rem] rounded-3xl border border-black/[0.06] bg-white p-10 text-center shadow-[0_1.5rem_5rem_rgba(53,45,124,0.08)]">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-dashed border-[#654cff]/35 text-[#654cff]">
        <UserRoundPlus className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-2xl font-black text-[#11142c]">
        Create or join a house
      </h2>
      <p className="mx-auto mt-2 max-w-xs text-[0.95rem] leading-relaxed text-[#5f667d]">
        Join an existing house if you have an invite or create your own to get
        started.
      </p>

      <div className="mt-7 grid gap-3 text-left">
        <HouseChoiceRow
          description="Build your own space. Invite your team and start collaborating."
          disabled={isSubmitting}
          icon={Plus}
          onClick={onCreateHouse}
          title="Create a house"
          tone="solid"
        />
        <HouseChoiceRow
          description="Enter an invite code to join your team house."
          disabled={isSubmitting}
          icon={Users}
          onClick={onJoinHouse}
          title="Join a house"
          tone="soft"
        />
      </div>

      <a
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#654cff]"
        href="#learn-houses"
      >
        Learn more about houses →
      </a>
    </section>
  );
}
