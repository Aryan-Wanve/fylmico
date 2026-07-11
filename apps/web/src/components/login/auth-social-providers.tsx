import Image from "next/image";
import { authSocialProviders } from "@/components/login/auth-data";

const API_BASE_URL = "/api/v1";

export function AuthSocialProviders() {
  return (
    <>
      <div className="my-5 flex items-center gap-4 text-[0.86rem] font-semibold text-[#838797]">
        <span className="h-px flex-1 bg-[#11142c1a]" />
        <span>or continue with</span>
        <span className="h-px flex-1 bg-[#11142c1a]" />
      </div>

      <div className="flex flex-col gap-4">
        {authSocialProviders.map((provider) => (
          <a
            className="flex h-[3.45rem] items-center justify-center gap-2.5 rounded-lg border border-[#11142c1a] bg-white font-extrabold text-[#15172b] shadow-[0_0.7rem_1.6rem_rgba(42,39,84,0.035)] transition hover:-translate-y-px"
            href={`${API_BASE_URL}/auth/${provider.id}`}
            key={provider.id}
          >
            <Image alt="" height={22} src={provider.icon} width={22} />
            Continue with {provider.label}
          </a>
        ))}
      </div>
    </>
  );
}
