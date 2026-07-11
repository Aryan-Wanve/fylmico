import { withRoute } from "@/server/http";

export const GET = withRoute(async () => {
  return { status: "ok" };
});
