"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { hasSession } from "@/lib/session";
import {
  acceptInvitation,
  getInvitationPreview
} from "@/services/base-workspace.service";
import type { InvitationPreview } from "@/types/base";

type State = "loading" | "ready" | "accepting" | "error";

export default function InviteAcceptPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getInvitationPreview(token)
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
              : "This invitation link is invalid."
          );
          setState("error");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handleAccept() {
    setState("accepting");
    setError("");

    try {
      await acceptInvitation(token);
      router.push("/");
    } catch (acceptError) {
      setError(
        acceptError instanceof Error
          ? acceptError.message
          : "Could not accept this invitation."
      );
      setState("ready");
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#f7f7fb] p-6">
      <div className="w-full max-w-md rounded-3xl border border-black/[0.06] bg-white p-10 text-center shadow-[0_1.5rem_5rem_rgba(53,45,124,0.08)]">
        {state === "loading" ? (
          <p className="text-sm text-[#5f667d]">Loading invitation...</p>
        ) : null}

        {state === "error" ? (
          <>
            <h1 className="text-2xl font-black text-[#11142c]">
              Invitation not found
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#5f667d]">
              {error}
            </p>
            <Link
              className="mt-6 inline-block text-sm font-bold text-[#654cff]"
              href="/login"
            >
              Back to login
            </Link>
          </>
        ) : null}

        {(state === "ready" || state === "accepting") && preview ? (
          <>
            <h1 className="text-2xl font-black text-[#11142c]">
              Join {preview.houseName}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#5f667d]">
              {preview.invitedByName} invited{" "}
              <strong className="text-[#11142c]">{preview.email}</strong> to
              join this house on Fylmico.
            </p>
            {preview.houseDescription ? (
              <p className="mt-3 rounded-xl bg-[#f7f7fb] px-4 py-3 text-sm text-[#5f667d]">
                {preview.houseDescription}
              </p>
            ) : null}

            {error ? (
              <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>
            ) : null}

            {hasSession() ? (
              <Button
                className="mt-6 h-12 w-full rounded-lg bg-gradient-to-br from-[#654cff] to-[#5b3ff0] font-bold text-white hover:opacity-95"
                disabled={state === "accepting"}
                onClick={handleAccept}
              >
                {state === "accepting" ? "Joining..." : "Accept & Join"}
              </Button>
            ) : (
              <div className="mt-6 grid gap-2">
                <p className="text-xs text-[#8a90a3]">
                  Log in or sign up, then come back to this link to accept.
                </p>
                <Link
                  className="flex h-12 w-full items-center justify-center rounded-lg bg-gradient-to-br from-[#654cff] to-[#5b3ff0] font-bold text-white hover:opacity-95"
                  href="/login"
                >
                  Log in
                </Link>
                <Link
                  className="flex h-12 w-full items-center justify-center rounded-lg border border-black/10 font-bold text-[#4b5268] hover:bg-black/[0.03]"
                  href="/signup"
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
