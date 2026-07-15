"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Inbox, Users } from "lucide-react";
import { HouseChoiceCard } from "@/components/houses/house-choice-card";
import { JoinRequestsDialog } from "@/components/houses/join-requests-dialog";
import { useWorkspace } from "@/lib/workspace-context";
import {
  activateHouse,
  createHouse,
  joinHouse,
  requestToJoinHouse
} from "@/services/base-workspace.service";
import type { House } from "@/types/base";
import type { HouseType } from "@/lib/house-types";

export function HousesDashboardPage() {
  const router = useRouter();
  const { workspace, refreshWorkspace } = useWorkspace();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState("");
  const [reviewingHouse, setReviewingHouse] = useState<House | null>(null);

  async function handleEnterHouse(house: House) {
    await activateHouse(house.id);
    await refreshWorkspace();
    router.push("/home");
  }

  async function handleCreateHouse(data: {
    name: string;
    handle: string;
    description: string;
    houseType: HouseType;
  }) {
    setIsSubmitting(true);
    setError("");
    try {
      await createHouse(data);
      await refreshWorkspace();
      router.push("/home");
    } catch (createError) {
      setError(getErrorMessage(createError));
      setIsSubmitting(false);
    }
  }

  async function handleJoinHouse(data: { inviteCode: string }) {
    setIsSubmitting(true);
    setError("");
    try {
      await joinHouse(data);
      await refreshWorkspace();
      router.push("/home");
    } catch (joinError) {
      setError(getErrorMessage(joinError));
      setIsSubmitting(false);
    }
  }

  async function handleRequestJoinHouse(data: { handle: string }) {
    setIsSubmitting(true);
    setError("");
    try {
      await requestToJoinHouse(data);
      setRequestSent(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  const houses = workspace.houses;

  return (
    <div className="grid min-h-full grid-cols-1 gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_26rem]">
      <div className="grid content-start gap-6">
        <div>
          <h1 className="text-2xl font-black text-[#11142c] sm:text-3xl dark:text-[#f1f2f8]">
            Your Houses
          </h1>
          <p className="mt-1 text-sm text-[#5f667d] sm:text-base dark:text-[#a8acbf]">
            Pick a house to continue, or create/join another.
          </p>
        </div>

        {houses.length === 0 ? (
          <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-black/10 bg-white/60 p-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <Home className="h-6 w-6 text-[#8a90a3] dark:text-[#7d8299]" />
            <p className="text-sm text-[#8a90a3] dark:text-[#7d8299]">
              You&apos;re not in a house yet. Create or join one to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {houses.map((house) => {
              const myRole = house.members.find(
                (member) => member.id === workspace.user.id
              )?.role;
              const isOwner = myRole === "Owner";

              return (
                <div
                  className="group flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-white p-5 text-left shadow-[0_1rem_3rem_rgba(53,45,124,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_1.2rem_3.5rem_rgba(53,45,124,0.1)] dark:border-white/[0.08] dark:bg-[#171a28]"
                  key={house.id}
                >
                  <button
                    className="grid flex-1 gap-3 text-left"
                    onClick={() => handleEnterHouse(house)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#7257ff] to-[#563df0] text-white">
                        <Home className="h-5 w-5" />
                      </span>
                      {house.id === workspace.activeHouseId ? (
                        <span className="rounded-full bg-[#654cff]/10 px-2 py-0.5 text-[0.65rem] font-bold text-[#654cff]">
                          Active
                        </span>
                      ) : null}
                    </div>
                    <div>
                      <h3 className="truncate text-base font-bold text-[#11142c] dark:text-[#f1f2f8]">
                        {house.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
                        @{house.handle}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-sm text-[#5f667d] dark:text-[#a8acbf]">
                        {house.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8a90a3] dark:text-[#7d8299]">
                      <Users className="h-3.5 w-3.5" />
                      {house.members.length} member
                      {house.members.length === 1 ? "" : "s"}
                      {myRole ? ` · ${myRole}` : ""}
                    </div>
                  </button>

                  {isOwner ? (
                    <button
                      className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-black/10 py-2 text-xs font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
                      onClick={() => setReviewingHouse(house)}
                      type="button"
                    >
                      <Inbox className="h-3.5 w-3.5" />
                      Join requests
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid content-start justify-items-center gap-4">
        <HouseChoiceCard
          isSubmitting={isSubmitting}
          onCreateHouse={handleCreateHouse}
          onJoinHouse={handleJoinHouse}
          onRequestJoinHouse={handleRequestJoinHouse}
          requestSent={requestSent}
        />
        {error ? (
          <p className="w-full max-w-[30rem] rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-center text-sm font-semibold text-red-600">
            {error}
          </p>
        ) : null}
      </div>

      {reviewingHouse ? (
        <JoinRequestsDialog
          houseId={reviewingHouse.id}
          houseName={reviewingHouse.name}
          onOpenChange={(open) => {
            if (!open) {
              setReviewingHouse(null);
            }
          }}
          onResolved={refreshWorkspace}
          open={Boolean(reviewingHouse)}
        />
      ) : null}
    </div>
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}
