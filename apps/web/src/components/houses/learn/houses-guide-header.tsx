import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function HousesGuideHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/80 px-6 py-4 backdrop-blur-xl sm:px-10 dark:border-white/[0.06]">
      <Link className="flex items-center gap-2.5" href="/dashboard">
        <Image
          alt=""
          height={28}
          src="/images/login/brand-mark.png"
          width={28}
        />
        <span className="text-lg font-black text-[#12142b] dark:text-[#f1f2f8]">
          fylmico
        </span>
      </Link>
      <Link
        className="flex items-center gap-1.5 text-sm font-bold text-[#4b5268] hover:text-[#11142c] dark:text-[#c7cad9] dark:hover:text-[#f1f2f8]"
        href="/dashboard"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
    </header>
  );
}
