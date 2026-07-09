import { Suspense } from "react";
import { VerifyEmailPage } from "@/components/login/verify-email-page";

export default function VerifyEmailRoute() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPage />
    </Suspense>
  );
}
