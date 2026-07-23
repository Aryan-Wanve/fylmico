import { NextResponse, type NextRequest } from "next/server";
import { VerifyOtpDto } from "@/server/review-sessions/dto/verify-otp.dto";
import { reviewSessionsService } from "@/server/review-sessions/review-sessions.service";
import { readJsonBody, toErrorResponse, validateDto } from "@/server/http";

// Not built on withParamsRoute like every other route here - this one needs
// to attach a Set-Cookie header to the response, which that helper's plain
// NextResponse.json(...) wrapper has no hook for.
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const dto = await validateDto(VerifyOtpDto, await readJsonBody(request));
    const { cookieName, cookieValue } = await reviewSessionsService.verifyOtp(
      token,
      dto.code
    );

    const response = NextResponse.json({ data: { verified: true } });
    response.cookies.set(cookieName, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}
