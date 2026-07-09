"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginPage, type LoginAsyncState } from "@/components/login/login-page";
import { login } from "@/services/base-workspace.service";

export default function LoginRoute() {
  const router = useRouter();
  const [authState, setAuthState] = useState<LoginAsyncState>("idle");
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setAuthState("loading");
    setError("");

    try {
      await login({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? "")
      });
      setAuthState("success");
      router.push("/");
    } catch (loginError) {
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
