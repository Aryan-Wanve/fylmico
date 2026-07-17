import type { NextRequest } from "next/server";
import { filesService } from "@/server/files/files.service";
import { AppException, HttpStatus, withParamsRoute } from "@/server/http";

// Unauthenticated by design: the signed upload token (minted only after a
// membership check in filesService.initiateUpload) is the credential, the
// same trust model as the existing file-download token.
export const PUT = withParamsRoute<{ token: string }>(
  async (request: NextRequest, { token }) => {
    const contentRange = request.headers.get("content-range");
    const match = contentRange?.match(/^bytes (\d+)-(\d+)\/(\d+)$/);
    if (!match) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "invalid_request",
        "A valid Content-Range header (bytes start-end/total) is required."
      );
    }

    const [, start, end, total] = match;
    const chunk = await request.arrayBuffer();

    return filesService.relayUploadChunk(
      token,
      chunk,
      Number(start),
      Number(end),
      Number(total)
    );
  }
);
