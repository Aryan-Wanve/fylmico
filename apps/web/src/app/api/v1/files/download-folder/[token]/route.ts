import { downloadZip } from "client-zip";
import { NextResponse } from "next/server";
import { verifyFolderZipToken } from "@/server/drive/drive-token.util";
import { driveService } from "@/server/drive/drive.service";
import { filesService } from "@/server/files/files.service";

// Fetches each file from Drive lazily, one at a time, as the zip stream
// pulls the next entry - never holds more than one file's bytes (or Drive
// connection) in memory at once, so a raw-footage folder full of large
// video clips doesn't blow up server memory the way buffering the whole
// zip first would.
async function* zipSource(
  organizationId: string,
  files: { path: string; driveFileId: string }[]
) {
  for (const file of files) {
    const driveResponse = await driveService.download(
      organizationId,
      file.driveFileId
    );
    if (driveResponse.body) {
      yield { name: file.path, input: driveResponse.body };
    }
  }
}

// Unauthenticated by design: the short-lived signed token (minted only
// after a membership check in filesService.getFolderZipUrl) is the
// credential here, the same trust model the single-file download route
// uses.
export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  let entryId: string;
  try {
    entryId = verifyFolderZipToken(token);
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

  const manifest = await filesService.buildFolderZipManifest(entryId);
  if (!manifest) {
    return NextResponse.json(
      {
        error: {
          code: "folder_not_found",
          message: "This folder no longer exists."
        }
      },
      { status: 404 }
    );
  }
  if (manifest.files.length === 0) {
    return NextResponse.json(
      {
        error: {
          code: "folder_empty",
          message: "This folder has no files to download yet."
        }
      },
      { status: 400 }
    );
  }

  const zip = downloadZip(zipSource(manifest.organizationId, manifest.files));

  return new NextResponse(zip.body, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(manifest.folderName)}.zip"`
    }
  });
}
