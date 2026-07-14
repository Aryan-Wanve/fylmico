"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginPage, type LoginAsyncState } from "@/components/login/login-page";
import { login } from "@/services/base-workspace.service";
import { getSafeRedirect } from "@/lib/redirect";
import { ApiError } from "@/lib/api/client";

function LoginRouteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authState, setAuthState] = useState<LoginAsyncState>("idle");
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");

    setAuthState("loading");
    setError("");

    try {
      await login({ email, password: String(form.get("password") ?? "") });
      setAuthState("success");
      router.push(getSafeRedirect(searchParams.get("redirectTo")));
    } catch (loginError) {
      if (
        loginError instanceof ApiError &&
        loginError.code === "email_not_verified"
      ) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      setAuthState("error");
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Something went wrong."
      );
    }
  }

  return (
    <LoginPage authState={authState} error={error} onLogin={handleLogin} />
  );
}

export default function LoginRoute() {
  return (
    <Suspense fallback={null}>
      <LoginRouteContent />
    </Suspense>
  );
}
