import { Suspense } from "react";
import { ResetPasswordPage } from "@/components/login/reset-password-page";

export default function ResetPasswordRoute() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPage />
    </Suspense>
  );
}
