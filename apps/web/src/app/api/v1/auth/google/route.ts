import { NextResponse } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { generateOpaqueToken } from "@/server/auth/token.util";
import { toErrorResponse } from "@/server/http";

const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";

export function GET() {
  try {
    const state = generateOpaqueToken();
    const url = authService.getGoogleAuthUrl(state);

    const response = NextResponse.redirect(url);
    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 5 * 60,
      path: "/"
    });
    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}
