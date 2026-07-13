import { Suspense } from "react";
import { SignupPage } from "@/components/signup/signup-page";

export default function SignupRoute() {
  return (
    <Suspense fallback={null}>
      <SignupPage />
    </Suspense>
  );
}
