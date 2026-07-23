"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GOOGLE_OAUTH_MESSAGE_SOURCE,
  isGoogleOAuthPopup
} from "@/lib/google-oauth-popup";
import { setSession } from "@/lib/session";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");

    if (isGoogleOAuthPopup()) {
      // Opened by AuthSocialProviders' window.open() - report the result
      // back to the tab that opened us and close, instead of navigating
      // this (popup) window anywhere.
      window.opener?.postMessage(
        error || !accessToken || !refreshToken
          ? {
              source: GOOGLE_OAUTH_MESSAGE_SOURCE,
              success: false,
              error: error ?? "missing_tokens"
            }
          : {
              source: GOOGLE_OAUTH_MESSAGE_SOURCE,
              success: true,
              accessToken,
              refreshToken
            },
        window.location.origin
      );
      window.close();
      return;
    }

    if (error || !accessToken || !refreshToken) {
      router.replace("/login?error=google_oauth_failed");
      return;
    }

    setSession(accessToken, refreshToken);
    router.replace("/home");
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center text-[#15172b] dark:text-[#f1f2f8]">
      Signing you in...
    </div>
  );
}

export default function AuthCallbackRoute() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  );
}
