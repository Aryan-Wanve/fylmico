import type { NextRequest } from "next/server";
import { AppException, HttpStatus } from "../http";
import { verifyAccessToken } from "./jwt";

export interface AuthenticatedUser {
  id: string;
  sessionId: string;
}

function extractBearerToken(request: NextRequest): string | undefined {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }
  return header.slice("Bearer ".length);
}

export function requireUser(request: NextRequest): AuthenticatedUser {
  const token = extractBearerToken(request);
  if (!token) {
    throw new AppException(
      HttpStatus.UNAUTHORIZED,
      "unauthenticated",
      "Authentication is required."
    );
  }

  try {
    const payload = verifyAccessToken(token);
    return { id: payload.sub, sessionId: payload.sid };
  } catch {
    throw new AppException(
      HttpStatus.UNAUTHORIZED,
      "unauthenticated",
      "Invalid or expired access token."
    );
  }
}
