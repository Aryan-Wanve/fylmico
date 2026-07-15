import { NextResponse, type NextRequest } from "next/server";
import { driveService } from "@/server/drive/drive.service";
import { driveStructureService } from "@/server/drive/drive-structure.service";
import { getAppUrl } from "@/server/mail/mailer";
import { prisma } from "@/server/prisma";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") ?? undefined;
  const state = request.nextUrl.searchParams.get("state") ?? undefined;
  const error = request.nextUrl.searchParams.get("error") ?? undefined;

  if (error || !code || !state) {
    return NextResponse.redirect(new URL("/files?driveError=1", getAppUrl()));
  }

  try {
    const { organizationId } = await driveService.handleCallback(code, state);
    await driveStructureService.ensureHouseSkeleton(organizationId);

    const members = await prisma.organizationMembership.findMany({
      where: { organizationId },
      include: { user: true }
    });
    for (const member of members) {
      await driveStructureService.ensureEmployeeFolder(
        organizationId,
        member.userId,
        member.user.name
      );
    }

    return NextResponse.redirect(
      new URL("/files?driveConnected=1", getAppUrl())
    );
  } catch {
    return NextResponse.redirect(new URL("/files?driveError=1", getAppUrl()));
  }
}
