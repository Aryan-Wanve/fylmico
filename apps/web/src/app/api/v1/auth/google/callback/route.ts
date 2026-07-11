import { NextResponse, type NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";

const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";

function clearStateCookie(response: NextResponse): NextResponse {
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") ?? undefined;
  const error = request.nextUrl.searchParams.get("error") ?? undefined;
  const state = request.nextUrl.searchParams.get("state") ?? undefined;
  const expectedState = request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

  if (error || !code || !state || !expectedState || state !== expectedState) {
    return clearStateCookie(
      NextResponse.redirect(
        new URL("/login?error=google_oauth_failed", request.url)
      )
    );
  }

  try {
    const { accessToken, refreshToken } =
      await authService.handleGoogleCallback(code);
    const params = new URLSearchParams({ accessToken, refreshToken });
    return clearStateCookie(
      NextResponse.redirect(
        new URL(`/auth/callback?${params.toString()}`, request.url)
      )
    );
  } catch {
    return clearStateCookie(
      NextResponse.redirect(
        new URL("/login?error=google_oauth_failed", request.url)
      )
    );
  }
}
