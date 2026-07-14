"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Hash, Plus, UserRoundPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HouseChoiceRow } from "@/components/houses/house-choice-row";

type Mode = "choice" | "create" | "join" | "request";

export function HouseChoiceCard({
  isSubmitting,
  requestSent,
  onCreateHouse,
  onJoinHouse,
  onRequestJoinHouse
}: {
  isSubmitting: boolean;
  requestSent: boolean;
  onCreateHouse: (data: {
    name: string;
    handle: string;
    description: string;
  }) => void;
  onJoinHouse: (data: { inviteCode: string }) => void;
  onRequestJoinHouse: (data: { handle: string }) => void;
}) {
  const [mode, setMode] = useState<Mode>("choice");

  function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onCreateHouse({
      name: String(form.get("name") ?? ""),
      handle: String(form.get("handle") ?? ""),
      description: String(form.get("description") ?? "")
    });
  }

  function handleJoinSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onJoinHouse({ inviteCode: String(form.get("inviteCode") ?? "") });
  }

  function handleRequestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onRequestJoinHouse({ handle: String(form.get("handle") ?? "") });
  }

  if (mode === "create") {
    return (
      <section className="w-full max-w-[30rem] rounded-3xl border border-black/[0.06] bg-white p-10 shadow-[0_1.5rem_5rem_rgba(53,45,124,0.08)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <button
          className="mb-5 flex items-center gap-1.5 text-sm font-bold text-[#5f667d] dark:text-[#a8acbf]"
          disabled={isSubmitting}
          onClick={() => setMode("choice")}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
          Create a house
        </h2>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
          Give your production house a name and a unique handle.
        </p>
        <form
          className="mt-6 grid gap-4 text-left"
          onSubmit={handleCreateSubmit}
        >
          <div className="grid gap-2">
            <Label htmlFor="house-name">House name</Label>
            <Input
              id="house-name"
              name="name"
              placeholder="Nova Frame House"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="house-handle">Handle</Label>
            <Input
              id="house-handle"
              name="handle"
              pattern="[a-z0-9-]+"
              placeholder="nova-frame"
              required
              title="Lowercase letters, numbers, and hyphens only"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="house-description">Description</Label>
            <Input
              id="house-description"
              name="description"
              placeholder="Commercial films, reels, and event edits."
            />
          </div>
          <Button
            className="mt-1 h-12 w-full rounded-lg bg-gradient-to-br from-[#654cff] to-[#5b3ff0] font-bold text-white hover:opacity-95"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Creating..." : "Create house"}
          </Button>
        </form>
      </section>
    );
  }

  if (mode === "join") {
    return (
      <section className="w-full max-w-[30rem] rounded-3xl border border-black/[0.06] bg-white p-10 shadow-[0_1.5rem_5rem_rgba(53,45,124,0.08)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <button
          className="mb-5 flex items-center gap-1.5 text-sm font-bold text-[#5f667d] dark:text-[#a8acbf]"
          disabled={isSubmitting}
          onClick={() => setMode("choice")}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
          Join a house
        </h2>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
          Enter the invite code your house owner shared with you.
        </p>
        <form className="mt-6 grid gap-4 text-left" onSubmit={handleJoinSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="invite-code">Invite code</Label>
            <Input
              id="invite-code"
              name="inviteCode"
              placeholder="NORT-2048"
              required
            />
          </div>
          <Button
            className="mt-1 h-12 w-full rounded-lg bg-gradient-to-br from-[#654cff] to-[#5b3ff0] font-bold text-white hover:opacity-95"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Joining..." : "Join house"}
          </Button>
        </form>
      </section>
    );
  }

  if (mode === "request") {
    return (
      <section className="w-full max-w-[30rem] rounded-3xl border border-black/[0.06] bg-white p-10 shadow-[0_1.5rem_5rem_rgba(53,45,124,0.08)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <button
          className="mb-5 flex items-center gap-1.5 text-sm font-bold text-[#5f667d] dark:text-[#a8acbf]"
          disabled={isSubmitting}
          onClick={() => setMode("choice")}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
          Request to join
        </h2>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
          Enter the house tag. The owner will need to approve your request.
        </p>
        {requestSent ? (
          <p className="mt-6 rounded-lg border border-[#654cff33] bg-[#654cff0d] px-3.5 py-3 text-sm font-semibold text-[#4a3bd1]">
            Request sent. You&apos;ll be notified once the owner responds.
          </p>
        ) : (
          <form
            className="mt-6 grid gap-4 text-left"
            onSubmit={handleRequestSubmit}
          >
            <div className="grid gap-2">
              <Label htmlFor="house-tag">House tag</Label>
              <Input
                id="house-tag"
                name="handle"
                placeholder="nova-frame"
                required
              />
            </div>
            <Button
              className="mt-1 h-12 w-full rounded-lg bg-gradient-to-br from-[#654cff] to-[#5b3ff0] font-bold text-white hover:opacity-95"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Sending..." : "Send request"}
            </Button>
          </form>
        )}
      </section>
    );
  }

  return (
    <section className="w-full max-w-[30rem] rounded-3xl border border-black/[0.06] bg-white p-10 text-center shadow-[0_1.5rem_5rem_rgba(53,45,124,0.08)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-dashed border-[#654cff]/35 text-[#654cff]">
        <UserRoundPlus className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
        Create or join a house
      </h2>
      <p className="mx-auto mt-2 max-w-xs text-[0.95rem] leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
        Join an existing house if you have an invite or create your own to get
        started.
      </p>

      <div className="mt-7 grid gap-3 text-left">
        <HouseChoiceRow
          description="Build your own space. Invite your team and start collaborating."
          disabled={isSubmitting}
          icon={Plus}
          onClick={() => setMode("create")}
          title="Create a house"
          tone="solid"
        />
        <HouseChoiceRow
          description="Enter an invite code to join your team house."
          disabled={isSubmitting}
          icon={Users}
          onClick={() => setMode("join")}
          title="Join a house"
          tone="soft"
        />
        <HouseChoiceRow
          description="Know a house tag? Request to join and the owner will approve it."
          disabled={isSubmitting}
          icon={Hash}
          onClick={() => setMode("request")}
          title="Request to join by tag"
          tone="soft"
        />
      </div>

      <Link
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#654cff]"
        href="/houses/learn"
      >
        Learn more about houses →
      </Link>
    </section>
  );
}
