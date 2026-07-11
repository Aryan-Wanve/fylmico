import Image from "next/image";

export function HousesGuideHero() {
  return (
    <section className="grid grid-cols-1 items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-2 lg:py-16">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#654cff]/10 px-3 py-1 text-xs font-bold text-[#654cff]">
          The Houses Guide
        </span>
        <h1 className="mt-4 max-w-lg text-[2.5rem] leading-[1.1] font-black tracking-tight text-[#11142c] xl:text-[2.9rem] dark:text-[#f1f2f8]">
          A private workspace for{" "}
          <span className="text-[#654cff]">every production</span> you run.
        </h1>
        <p className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-[#5f667d] dark:text-[#a8acbf]">
          A House is where your crew plans, shoots, edits, and delivers —
          together, in one place. Here&apos;s everything it does and how teams
          like yours use it.
        </p>
      </div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-[0_1.5rem_3.5rem_rgba(53,45,124,0.16)]">
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="(min-width: 1024px) 40rem, 100vw"
          src="/images/login-production-set.png"
        />
      </div>
    </section>
  );
}
