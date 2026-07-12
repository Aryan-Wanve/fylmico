import { NextResponse, type NextRequest } from "next/server";
import { driveService } from "@/server/drive/drive.service";
import { getAppUrl } from "@/server/mail/mailer";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") ?? undefined;
  const state = request.nextUrl.searchParams.get("state") ?? undefined;
  const error = request.nextUrl.searchParams.get("error") ?? undefined;

  if (error || !code || !state) {
    return NextResponse.redirect(new URL("/files?driveError=1", getAppUrl()));
  }

  try {
    await driveService.handleCallback(code, state);
    return NextResponse.redirect(
      new URL("/files?driveConnected=1", getAppUrl())
    );
  } catch {
    return NextResponse.redirect(new URL("/files?driveError=1", getAppUrl()));
  }
}
