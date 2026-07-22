"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  GraduationCap,
  Hash,
  Heart,
  Home,
  Plus,
  Settings2,
  Sparkles,
  User,
  Users,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HouseChoiceRow } from "@/components/houses/house-choice-row";
import { checkHandleAvailability } from "@/services/base-workspace.service";
import {
  HOUSE_TYPES,
  HOUSE_TYPE_INFO,
  type HouseType
} from "@/lib/house-types";

type Mode =
  "choice" | "create-type" | "create-name" | "create-tag" | "join" | "request";

const HANDLE_PATTERN = /^[a-z0-9]{3,20}$/;

const HOUSE_TYPE_ICONS: Record<HouseType, typeof User> = {
  freelancer: User,
  agency: Building2,
  college: GraduationCap,
  hobbyist: Heart,
  custom: Settings2
};

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
    houseType: HouseType;
  }) => void;
  onJoinHouse: (data: { inviteCode: string }) => void;
  onRequestJoinHouse: (data: { handle: string }) => void;
}) {
  const [mode, setMode] = useState<Mode>("choice");
  const [houseType, setHouseType] = useState<HouseType>("custom");
  const [houseName, setHouseName] = useState("");
  const [houseHandle, setHouseHandle] = useState("");
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [checkingHandle, setCheckingHandle] = useState(false);

  useEffect(() => {
    if (!HANDLE_PATTERN.test(houseHandle)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting availability status as the handle input changes, not deriving render output
      setHandleAvailable(null);
      return;
    }

    setCheckingHandle(true);
    const timeout = setTimeout(() => {
      checkHandleAvailability(houseHandle)
        .then(setHandleAvailable)
        .catch(() => setHandleAvailable(null))
        .finally(() => setCheckingHandle(false));
    }, 400);

    return () => clearTimeout(timeout);
  }, [houseHandle]);

  function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreateHouse({ name: houseName.trim(), handle: houseHandle, houseType });
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

  if (mode === "create-type") {
    return (
      <section className="w-full max-w-[30rem] rounded-3xl border border-black/[0.06] bg-white p-10 shadow-[0_1.5rem_5rem_rgba(53,45,124,0.08)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <button
          className="mb-5 flex items-center gap-1.5 text-sm font-bold text-[#5f667d] dark:text-[#a8acbf]"
          onClick={() => setMode("choice")}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
          Choose your house type
        </h2>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
          This sets which modules are enabled by default — you can change this
          anytime from House Settings.
        </p>
        <div className="mt-6 grid gap-3 text-left">
          {HOUSE_TYPES.map((type) => (
            <HouseChoiceRow
              description={HOUSE_TYPE_INFO[type].description}
              icon={HOUSE_TYPE_ICONS[type]}
              key={type}
              onClick={() => {
                setHouseType(type);
                setMode("create-name");
              }}
              title={HOUSE_TYPE_INFO[type].label}
              tone="soft"
            />
          ))}
        </div>
      </section>
    );
  }

  if (mode === "create-name") {
    return (
      <section className="w-full max-w-[30rem] rounded-3xl border border-black/[0.06] bg-white p-10 shadow-[0_1.5rem_5rem_rgba(53,45,124,0.08)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <button
          className="mb-5 flex items-center gap-1.5 text-sm font-bold text-[#5f667d] dark:text-[#a8acbf]"
          disabled={isSubmitting}
          onClick={() => setMode("create-type")}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
          Name your house
        </h2>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
          You can change this anytime from House Settings.
        </p>
        <form
          className="mt-6 grid gap-4 text-left"
          onSubmit={(event) => {
            event.preventDefault();
            setMode("create-tag");
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="house-name">House name</Label>
            <Input
              id="house-name"
              onChange={(event) => setHouseName(event.target.value)}
              placeholder="Nova Frame House"
              required
              value={houseName}
            />
          </div>
          <Button
            className="mt-1 h-12 w-full rounded-lg bg-gradient-to-br from-[var(--fylmico-accent)] to-[#5b3ff0] font-bold text-white hover:opacity-95"
            disabled={!houseName.trim()}
            type="submit"
          >
            Next
          </Button>
        </form>
      </section>
    );
  }

  if (mode === "create-tag") {
    const validFormat = HANDLE_PATTERN.test(houseHandle);
    const canSubmit = validFormat && handleAvailable === true;

    return (
      <section className="w-full max-w-[30rem] rounded-3xl border border-black/[0.06] bg-white p-10 shadow-[0_1.5rem_5rem_rgba(53,45,124,0.08)] dark:border-white/[0.08] dark:bg-[#171a28]">
        <button
          className="mb-5 flex items-center gap-1.5 text-sm font-bold text-[#5f667d] dark:text-[#a8acbf]"
          disabled={isSubmitting}
          onClick={() => setMode("create-name")}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
          Choose a house tag
        </h2>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
          Lowercase letters and numbers only, 3-20 characters. This is your
          house&apos;s unique handle.
        </p>
        <form
          className="mt-6 grid gap-2 text-left"
          onSubmit={handleCreateSubmit}
        >
          <Label htmlFor="house-handle">House tag</Label>
          <Input
            id="house-handle"
            onChange={(event) =>
              setHouseHandle(event.target.value.toLowerCase())
            }
            placeholder="filmverse"
            required
            value={houseHandle}
          />
          {houseHandle && validFormat ? (
            <p
              className={`flex items-center gap-1.5 text-sm font-semibold ${
                handleAvailable ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {checkingHandle ? (
                "Checking..."
              ) : handleAvailable ? (
                <>
                  <Check className="h-4 w-4" /> {houseHandle} available
                </>
              ) : (
                <>
                  <X className="h-4 w-4" /> already taken
                </>
              )}
            </p>
          ) : houseHandle ? (
            <p className="text-sm font-semibold text-red-600">
              Lowercase letters and numbers only, 3-20 characters.
            </p>
          ) : null}
          <Button
            className="mt-3 h-12 w-full rounded-lg bg-gradient-to-br from-[var(--fylmico-accent)] to-[#5b3ff0] font-bold text-white hover:opacity-95"
            disabled={isSubmitting || !canSubmit}
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
            className="mt-1 h-12 w-full rounded-lg bg-gradient-to-br from-[var(--fylmico-accent)] to-[#5b3ff0] font-bold text-white hover:opacity-95"
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
              className="mt-1 h-12 w-full rounded-lg bg-gradient-to-br from-[var(--fylmico-accent)] to-[#5b3ff0] font-bold text-white hover:opacity-95"
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
    <section className="w-full max-w-[26rem] rounded-3xl border border-black/[0.06] bg-white p-8 text-center shadow-[0_1.5rem_5rem_rgba(53,45,124,0.08)] dark:border-white/[0.08] dark:bg-[#171a28]">
      <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full border border-dashed border-[var(--fylmico-accent)]/35 text-[var(--fylmico-accent)]">
        <Home className="h-7 w-7" />
        <Sparkles className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 text-pink-400" />
        <Sparkles className="absolute -bottom-1 -left-2 h-3 w-3 text-[var(--fylmico-accent)]/70" />
      </div>
      <h2 className="mt-5 text-xl font-black text-[#11142c] dark:text-[#f1f2f8]">
        Create or join a house
      </h2>
      <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
        Start fresh or join an existing creative hub.
      </p>

      <div className="mt-6 grid gap-3 text-left">
        <HouseChoiceRow
          description="Build your own space. Invite your team and start collaborating."
          disabled={isSubmitting}
          icon={Plus}
          onClick={() => setMode("create-type")}
          title="Create a house"
          tone="purple"
        />
        <HouseChoiceRow
          description="Enter an invite code to join your team house."
          disabled={isSubmitting}
          icon={Users}
          onClick={() => setMode("join")}
          title="Join a house"
          tone="pink"
        />
        <HouseChoiceRow
          description="Know a house tag? Request to join and the owner will approve it."
          disabled={isSubmitting}
          icon={Hash}
          onClick={() => setMode("request")}
          title="Request to join by tag"
          tone="blue"
        />
      </div>
    </section>
  );
}
