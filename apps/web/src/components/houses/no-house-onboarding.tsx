"use client";

import Image from "next/image";
import { useState } from "react";
import { HouseChoiceCard } from "@/components/houses/house-choice-card";
import { useWorkspace } from "@/lib/workspace-context";
import { createHouse, joinHouse } from "@/services/base-workspace.service";

export function NoHouseOnboarding() {
  const { refreshWorkspace } = useWorkspace();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateHouse() {
    setIsSubmitting(true);
    setError("");

    try {
      await createHouse({
        name: "Nova Frame House",
        handle: "nova-frame",
        description: "Commercial films, reels, launch videos, and event edits."
      });
      await refreshWorkspace();
    } catch (createError) {
      setError(getErrorMessage(createError));
      setIsSubmitting(false);
    }
  }

  async function handleJoinHouse() {
    setIsSubmitting(true);
    setError("");

    try {
      await joinHouse({ inviteCode: "NOVA-2048" });
      await refreshWorkspace();
    } catch (joinError) {
      setError(getErrorMessage(joinError));
      setIsSubmitting(false);
    }
  }

  return (
    <section className="flex min-h-full items-center justify-center p-6 lg:p-10">
      <div className="grid w-full max-w-[68rem] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h1 className="max-w-md text-[2.75rem] leading-[1.08] font-black tracking-tight text-[#11142c]">
            You&apos;re not in <span className="text-[#654cff]">a house</span>{" "}
            yet.
          </h1>
          <p className="mt-4 max-w-sm text-[1.05rem] leading-relaxed text-[#5f667d]">
            Houses are where teams plan, create and bring productions to life.
          </p>
          <div className="relative mt-8 h-64 w-full max-w-md overflow-hidden rounded-2xl shadow-[0_1.2rem_3rem_rgba(53,45,124,0.14)]">
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 28rem, 100vw"
              src="/images/login-production-set.png"
            />
          </div>
        </div>

        <div className="flex justify-center lg:justify-start">
          <div className="grid w-full max-w-[30rem] gap-4">
            <HouseChoiceCard
              isSubmitting={isSubmitting}
              onCreateHouse={handleCreateHouse}
              onJoinHouse={handleJoinHouse}
            />
            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-center text-sm font-semibold text-red-600">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}
