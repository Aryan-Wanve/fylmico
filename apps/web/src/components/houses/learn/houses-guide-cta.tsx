import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HousesGuideCta() {
  return (
    <section className="px-6 py-14 sm:px-10">
      <div className="mx-auto grid max-w-3xl gap-5 rounded-3xl bg-gradient-to-br from-[#654cff] to-[#5b3ff0] p-10 text-center text-white shadow-[0_1.5rem_4rem_rgba(101,76,255,0.28)]">
        <h2 className="text-2xl font-black sm:text-3xl">
          Ready to bring your crew together?
        </h2>
        <p className="mx-auto max-w-md text-white/85">
          Create your first house in under a minute, or join one with an invite
          code from your team.
        </p>
        <div className="mx-auto flex flex-wrap items-center justify-center gap-3">
          <Link
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#654cff] hover:bg-white/90 dark:bg-[#171a28]"
            href="/houses/new"
          >
            Create a House
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            className="rounded-xl border border-white/30 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
            href="/houses/new"
          >
            Join with an Invite Code
          </Link>
        </div>
      </div>
    </section>
  );
}
