import { NextResponse, type NextRequest } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { extractRequestMeta } from "@/server/auth/require-user";
import { getAppUrl } from "@/server/mail/mailer";

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

  // Built from NEXT_PUBLIC_APP_URL rather than request.url - behind
  // Hostinger's proxy, the Host header the Node process actually sees
  // isn't reliably the public domain, which previously produced redirects
  // to a bogus internal address (e.g. 0.0.0.0:3000) instead of the site.
  const appUrl = getAppUrl();

  if (error || !code || !state || !expectedState || state !== expectedState) {
    console.error("[auth/google/callback] rejected before token exchange", {
      hasError: Boolean(error),
      error,
      hasCode: Boolean(code),
      hasState: Boolean(state),
      hasExpectedState: Boolean(expectedState),
      stateMatches: state === expectedState
    });
    return clearStateCookie(
      NextResponse.redirect(new URL("/login?error=google_oauth_failed", appUrl))
    );
  }

  try {
    const { accessToken, refreshToken } =
      await authService.handleGoogleCallback(code, extractRequestMeta(request));
    const params = new URLSearchParams({ accessToken, refreshToken });
    return clearStateCookie(
      NextResponse.redirect(
        new URL(`/auth/callback?${params.toString()}`, appUrl)
      )
    );
  } catch (callbackError) {
    console.error(
      "[auth/google/callback] token exchange failed",
      callbackError
    );
    return clearStateCookie(
      NextResponse.redirect(new URL("/login?error=google_oauth_failed", appUrl))
    );
  }
}
