"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authSocialProviders } from "@/components/login/auth-data";
import {
  GOOGLE_OAUTH_MESSAGE_SOURCE,
  type GoogleOAuthMessage
} from "@/lib/google-oauth-popup";
import { setSession } from "@/lib/session";

const API_BASE_URL = "/api/v1";
const POPUP_WIDTH = 480;
const POPUP_HEIGHT = 640;

export function AuthSocialProviders() {
  const router = useRouter();
  const [error, setError] = useState("");
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function stopPolling() {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      popupRef.current = null;
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as GoogleOAuthMessage | undefined;
      if (data?.source !== GOOGLE_OAUTH_MESSAGE_SOURCE) return;

      stopPolling();
      if (!data.success) {
        setError("Could not sign in with Google. Please try again.");
        return;
      }
      setSession(data.accessToken, data.refreshToken);
      router.push("/home");
    }

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      stopPolling();
    };
  }, [router]);

  function handleProviderClick(providerId: string) {
    setError("");
    const url = `${API_BASE_URL}/auth/${providerId}`;
    const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2;
    const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2;

    const popup = window.open(
      url,
      "fylmico-google-oauth",
      `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top}`
    );

    if (!popup) {
      // Pop-up blocked - fall back to a full-page redirect rather than
      // leaving the click looking dead.
      window.location.assign(url);
      return;
    }

    popupRef.current = popup;
    // No message arrives if the user just closes the popup without
    // finishing - stop waiting once that happens so a later legitimate
    // attempt isn't confused by a stale reference.
    pollRef.current = setInterval(() => {
      if (popupRef.current?.closed) {
        popupRef.current = null;
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 500);
  }

  return (
    <>
      <div className="my-5 flex items-center gap-4 text-[0.86rem] font-semibold text-[#838797]">
        <span className="h-px flex-1 bg-[#11142c1a]" />
        <span>or continue with</span>
        <span className="h-px flex-1 bg-[#11142c1a]" />
      </div>

      <div className="flex flex-col gap-4">
        {authSocialProviders.map((provider) => (
          <button
            className="flex h-[3.45rem] items-center justify-center gap-2.5 rounded-lg border border-[#11142c1a] bg-white font-extrabold text-[#15172b] shadow-[0_0.7rem_1.6rem_rgba(42,39,84,0.035)] transition hover:-translate-y-px dark:bg-[#171a28] dark:text-[#f1f2f8]"
            key={provider.id}
            onClick={() => handleProviderClick(provider.id)}
            type="button"
          >
            <Image alt="" height={22} src={provider.icon} width={22} />
            Continue with {provider.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mt-3 text-center text-sm font-semibold text-red-600">
          {error}
        </p>
      ) : null}
    </>
  );
}
