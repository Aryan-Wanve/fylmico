"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AuthLayout } from "@/components/login/auth-layout";
import { AuthSecurityNote } from "@/components/login/auth-security-note";
import { verifyEmail } from "@/services/base-workspace.service";

type Status = "verifying" | "success" | "error";

export function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token") ?? "";
    let isMounted = true;

    verifyEmail(token)
      .then(() => {
        if (isMounted) {
          setStatus("success");
        }
      })
      .catch((verifyError) => {
        if (isMounted) {
          setStatus("error");
          setError(
            verifyError instanceof Error
              ? verifyError.message
              : "Something went wrong."
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  return (
    <AuthLayout>
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[27rem] rounded-2xl border border-black/[0.06] bg-white p-8 text-center shadow-[0_1.8rem_5rem_rgba(55,48,120,0.12)] dark:border-white/[0.08] dark:bg-[#171a28]"
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {status === "verifying" ? (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#654cff]" />
            <h2 className="mt-5 text-[1.5rem] font-black text-[#11142c] dark:text-[#f1f2f8]">
              Verifying your email...
            </h2>
          </>
        ) : null}

        {status === "success" ? (
          <>
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <h2 className="mt-5 text-[1.5rem] font-black text-[#11142c] dark:text-[#f1f2f8]">
              Email verified
            </h2>
            <p className="mt-2 font-semibold text-[#75798a] dark:text-[#8b8fa3]">
              Your email address has been confirmed.
            </p>
            <Link
              className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#654cff] to-[#5b3ff0] px-6 text-sm font-bold text-white hover:opacity-95"
              href="/"
            >
              Continue to Fylmico
            </Link>
          </>
        ) : null}

        {status === "error" ? (
          <>
            <XCircle className="mx-auto h-10 w-10 text-red-500" />
            <h2 className="mt-5 text-[1.5rem] font-black text-[#11142c] dark:text-[#f1f2f8]">
              Verification failed
            </h2>
            <p className="mt-2 font-semibold text-[#75798a] dark:text-[#8b8fa3]">
              {error}
            </p>
            <Link
              className="mt-6 inline-flex h-12 items-center justify-center rounded-lg border border-[#11142c1c] px-6 text-sm font-bold text-[#11142c] hover:bg-black/[0.03] dark:text-[#f1f2f8] dark:hover:bg-white/[0.05]"
              href="/login"
            >
              Back to log in
            </Link>
          </>
        ) : null}
      </motion.section>

      <AuthSecurityNote />
    </AuthLayout>
  );
}
