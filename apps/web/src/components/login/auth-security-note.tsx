import Image from "next/image";

export function AuthSecurityNote() {
  return (
    <aside className="mt-4 flex w-full max-w-[27rem] shrink-0 items-center gap-4 rounded-xl bg-white/70 p-3 text-[#515568] shadow-[0_0.8rem_2rem_rgba(53,45,124,0.06)] backdrop-blur-xl dark:bg-white/[0.04] dark:text-[#a8acbf]">
      <Image alt="" height={44} src="/images/login/security.png" width={44} />
      <p className="grid gap-1 text-[0.82rem] leading-snug">
        <strong className="text-[0.88rem] text-[#202437] dark:text-[#f1f2f8]">
          Your data is safe with us.
        </strong>
        <span>
          We use enterprise-grade security to keep your projects protected.
        </span>
      </p>
    </aside>
  );
}
