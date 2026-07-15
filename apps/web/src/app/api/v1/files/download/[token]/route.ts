import { NextResponse } from "next/server";
import { verifyDownloadToken } from "@/server/drive/drive-token.util";
import { driveService } from "@/server/drive/drive.service";
import { prisma } from "@/server/prisma";

// Unauthenticated by design: the short-lived signed token (minted only
// after a membership check in filesService.getDownloadUrl) *is* the
// credential here, the same trust model the old Supabase signed URL used.
export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  let entryId: string;
  try {
    entryId = verifyDownloadToken(token);
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "invalid_or_expired_token",
          message: "This download link is invalid or has expired."
        }
      },
      { status: 400 }
    );
  }

  const entry = await prisma.fileEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.type !== "file" || !entry.storagePath) {
    return NextResponse.json(
      {
        error: {
          code: "file_not_found",
          message: "This file no longer exists."
        }
      },
      { status: 404 }
    );
  }

  try {
    const driveResponse = await driveService.download(
      entry.organizationId,
      entry.storagePath
    );

    return new NextResponse(driveResponse.body, {
      status: 200,
      headers: {
        "Content-Type": entry.mimeType ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(entry.name)}"`
      }
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "download_failed",
          message: "Could not download this file from Google Drive."
        }
      },
      { status: 502 }
    );
  }
}
