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
    <section className="grid min-h-[calc(100vh-5rem)] grid-cols-1 items-center gap-12 px-10 py-12 lg:grid-cols-2 lg:px-16">
      <div>
        <h1 className="max-w-md text-[2.75rem] leading-[1.08] font-black tracking-tight text-[#11142c]">
          You&apos;re not in <span className="text-[#654cff]">a house</span>{" "}
          yet.
        </h1>
        <p className="mt-4 max-w-sm text-[1.05rem] leading-relaxed text-[#5f667d]">
          Houses are where teams plan, create and bring productions to life.
        </p>
        <div className="relative mt-8 h-64 w-full max-w-md overflow-hidden rounded-2xl">
          <Image
            alt=""
            className="object-cover"
            fill
            src="/images/login-production-set.png"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <div className="grid gap-4">
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
    </section>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}
