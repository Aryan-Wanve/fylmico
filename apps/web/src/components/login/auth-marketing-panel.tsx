import Image from "next/image";
import { authFeatures } from "@/components/login/auth-data";

export function AuthMarketingPanel() {
  return (
    <section className="relative hidden h-full flex-col overflow-hidden px-12 pt-11 md:flex xl:px-16">
      <div
        aria-hidden="true"
        className="absolute top-[5.8rem] left-[62%] z-[1] h-16 w-[5.4rem] opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(#8d91a9 1.35px, transparent 1.35px)",
          backgroundSize: "0.75rem 0.75rem"
        }}
      />

      <header
        aria-label="Fylmico"
        className="relative z-10 flex items-center gap-3"
      >
        <Image
          alt=""
          height={38}
          src="/images/login/brand-mark.png"
          width={38}
        />
        <span className="text-2xl font-black text-[#12142b]">fylmico</span>
      </header>

      <section
        aria-labelledby="login-heading"
        className="relative z-10 mt-11 max-w-[34rem]"
      >
        <h1
          className="max-w-[27rem] text-[3.1rem] leading-[1.05] font-black tracking-tight text-[#11142c] xl:text-[3.6rem]"
          id="login-heading"
        >
          All your production.
          <span className="block text-[#654cff]">One workspace.</span>
        </h1>
        <p className="mt-7 max-w-[23rem] border-l-2 border-[#6b55ff] pl-5 text-[1.05rem] leading-relaxed font-semibold text-[#4f5265]">
          Plan shoots. Manage teams. Track progress. Create stories. Fylmico
          keeps your production in sync, from pre to post.
        </p>
      </section>

      <section
        aria-label="Fylmico tools"
        className="relative z-10 mt-7 grid max-w-[42rem] grid-cols-4 gap-8"
      >
        {authFeatures.map((feature) => (
          <article className="min-w-0" key={feature.title}>
            <div className="grid h-[3.2rem] w-[3.2rem] place-items-center rounded-[0.78rem] border border-[#6d52ff14] bg-white/75 shadow-[0_1.1rem_2.5rem_rgba(87,70,180,0.12)] backdrop-blur-md">
              <Image alt="" height={26} src={feature.icon} width={26} />
            </div>
            <h2 className="mt-3 text-sm font-extrabold text-[#15172b]">
              {feature.title}
            </h2>
            <p className="mt-1 text-[0.79rem] leading-snug font-semibold text-[#4d5060]">
              {feature.body}
            </p>
          </article>
        ))}
      </section>

      <aside
        aria-label="Customer quote"
        className="absolute bottom-8 left-12 z-10 w-[min(17.7rem,42vw)] rounded-xl border border-white/25 bg-gradient-to-br from-white/15 via-white/5 to-black/25 p-5 text-white shadow-[0_1.2rem_3rem_rgba(10,8,35,0.45)] backdrop-blur-xl backdrop-saturate-150 xl:left-16"
      >
        <span className="text-[2.15rem] leading-[0.7] font-black text-white/90">
          &ldquo;
        </span>
        <p className="mt-1 mb-2 text-[0.88rem] leading-relaxed font-semibold text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]">
          Fylmico makes the complex, incredibly simple.
        </p>
        <strong className="text-[0.82rem] font-medium text-white/80">
          &ndash; Filmmaker, Mumbai
        </strong>
      </aside>
    </section>
  );
}
