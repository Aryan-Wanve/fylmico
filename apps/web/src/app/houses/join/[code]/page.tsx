"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { hasSession } from "@/lib/session";
import {
  getInviteCodePreview,
  joinHouse
} from "@/services/base-workspace.service";
import type { InviteCodePreview } from "@/types/base";

type State = "loading" | "ready" | "joining" | "error";

export default function JoinHousePage({
  params
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [preview, setPreview] = useState<InviteCodePreview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getInviteCodePreview(code)
      .then((data) => {
        if (isMounted) {
          setPreview(data);
          setState("ready");
        }
      })
      .catch((previewError) => {
        if (isMounted) {
          setError(
            previewError instanceof Error
              ? previewError.message
              : "This invite link is invalid."
          );
          setState("error");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [code]);

  async function handleJoin() {
    setState("joining");
    setError("");

    try {
      await joinHouse({ inviteCode: code });
      router.push("/home");
    } catch (joinError) {
      setError(
        joinError instanceof Error
          ? joinError.message
          : "Could not join this house."
      );
      setState("ready");
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#f7f7fb] p-6 dark:bg-[#0e0f18]">
      <div className="w-full max-w-md rounded-3xl border border-black/[0.06] bg-white p-10 text-center shadow-[0_1.5rem_5rem_rgba(53,45,124,0.08)] dark:border-white/[0.08] dark:bg-[#171a28]">
        {state === "loading" ? (
          <p className="text-sm text-[#5f667d] dark:text-[#a8acbf]">
            Loading invite...
          </p>
        ) : null}

        {state === "error" ? (
          <>
            <h1 className="text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
              Invite link not found
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
              {error}
            </p>
            <Link
              className="mt-6 inline-block text-sm font-bold text-[var(--fylmico-accent)]"
              href="/login"
            >
              Back to login
            </Link>
          </>
        ) : null}

        {(state === "ready" || state === "joining") && preview ? (
          <>
            <h1 className="text-2xl font-black text-[#11142c] dark:text-[#f1f2f8]">
              Join {preview.houseName}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
              {preview.memberCount}{" "}
              {preview.memberCount === 1 ? "member" : "members"} already here.
            </p>
            {preview.houseDescription ? (
              <p className="mt-3 rounded-xl bg-[#f7f7fb] px-4 py-3 text-sm text-[#5f667d] dark:bg-[#0e0f18] dark:text-[#a8acbf]">
                {preview.houseDescription}
              </p>
            ) : null}

            {error ? (
              <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>
            ) : null}

            {hasSession() ? (
              <Button
                className="mt-6 h-12 w-full rounded-lg bg-gradient-to-br from-[var(--fylmico-accent)] to-[#5b3ff0] font-bold text-white hover:opacity-95"
                disabled={state === "joining"}
                onClick={handleJoin}
              >
                {state === "joining" ? "Joining..." : "Join house"}
              </Button>
            ) : (
              <div className="mt-6 grid gap-2">
                <p className="text-xs text-[#667085] dark:text-[#7d8299]">
                  Log in or sign up, then come back to this link to join.
                </p>
                <Link
                  className="flex h-12 w-full items-center justify-center rounded-lg bg-gradient-to-br from-[var(--fylmico-accent)] to-[#5b3ff0] font-bold text-white hover:opacity-95"
                  href={`/login?redirectTo=${encodeURIComponent(`/houses/join/${code}`)}`}
                >
                  Log in
                </Link>
                <Link
                  className="flex h-12 w-full items-center justify-center rounded-lg border border-black/10 font-bold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
                  href={`/signup?redirectTo=${encodeURIComponent(`/houses/join/${code}`)}`}
                >
                  Sign up
                </Link>
              </div>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
