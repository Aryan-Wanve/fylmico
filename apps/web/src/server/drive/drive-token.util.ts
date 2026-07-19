import jwt from "jsonwebtoken";
import { requireEnv } from "../env";

interface DriveStateClaims {
  purpose: "drive_connect";
  organizationId: string;
  userId: string;
}

interface DownloadTokenClaims {
  purpose: "file_download";
  entryId: string;
}

interface FolderZipTokenClaims {
  purpose: "folder_zip_download";
  entryId: string;
}

export interface UploadSessionClaims {
  organizationId: string;
  userId: string;
  driveSessionUrl: string;
  parentId: string | null;
  name: string;
  mimeType: string;
  size: number;
  conversationId: string | null;
  taskId: string | null;
}

interface UploadSessionTokenClaims extends UploadSessionClaims {
  purpose: "upload_session";
}

export function signDriveState(organizationId: string, userId: string): string {
  const secret = requireEnv("JWT_ACCESS_SECRET");
  const claims: DriveStateClaims = {
    purpose: "drive_connect",
    organizationId,
    userId
  };
  return jwt.sign(claims, secret, { expiresIn: "10m" });
}

export function verifyDriveState(state: string): {
  organizationId: string;
  userId: string;
} {
  const secret = requireEnv("JWT_ACCESS_SECRET");
  const payload = jwt.verify(state, secret) as unknown as DriveStateClaims;
  if (payload.purpose !== "drive_connect") {
    throw new Error("Invalid Drive connect state.");
  }
  return { organizationId: payload.organizationId, userId: payload.userId };
}

export function signDownloadToken(entryId: string): string {
  const secret = requireEnv("JWT_ACCESS_SECRET");
  const claims: DownloadTokenClaims = { purpose: "file_download", entryId };
  return jwt.sign(claims, secret, { expiresIn: "10m" });
}

export function verifyDownloadToken(token: string): string {
  const secret = requireEnv("JWT_ACCESS_SECRET");
  const payload = jwt.verify(token, secret) as unknown as DownloadTokenClaims;
  if (payload.purpose !== "file_download") {
    throw new Error("Invalid download token.");
  }
  return payload.entryId;
}

export function signFolderZipToken(entryId: string): string {
  const secret = requireEnv("JWT_ACCESS_SECRET");
  const claims: FolderZipTokenClaims = {
    purpose: "folder_zip_download",
    entryId
  };
  return jwt.sign(claims, secret, { expiresIn: "10m" });
}

export function verifyFolderZipToken(token: string): string {
  const secret = requireEnv("JWT_ACCESS_SECRET");
  const payload = jwt.verify(token, secret) as unknown as FolderZipTokenClaims;
  if (payload.purpose !== "folder_zip_download") {
    throw new Error("Invalid folder download token.");
  }
  return payload.entryId;
}

// Wraps a Google Drive resumable-upload session URL in a short-lived signed
// token, mirroring signDownloadToken's trust model: the token *is* the
// credential for the upload-session routes (which are otherwise
// unauthenticated), so the raw Drive session URL - which is meaningless
// without our server's stored access token - never has to be trusted to
// the client directly.
export function signUploadSessionToken(claims: UploadSessionClaims): string {
  const secret = requireEnv("JWT_ACCESS_SECRET");
  const payload: UploadSessionTokenClaims = {
    purpose: "upload_session",
    ...claims
  };
  return jwt.sign(payload, secret, { expiresIn: "24h" });
}

export function verifyUploadSessionToken(token: string): UploadSessionClaims {
  const secret = requireEnv("JWT_ACCESS_SECRET");
  const payload = jwt.verify(
    token,
    secret
  ) as unknown as UploadSessionTokenClaims;
  if (payload.purpose !== "upload_session") {
    throw new Error("Invalid upload session token.");
  }
  return {
    organizationId: payload.organizationId,
    userId: payload.userId,
    driveSessionUrl: payload.driveSessionUrl,
    parentId: payload.parentId,
    name: payload.name,
    mimeType: payload.mimeType,
    size: payload.size,
    conversationId: payload.conversationId,
    taskId: payload.taskId
  };
}
