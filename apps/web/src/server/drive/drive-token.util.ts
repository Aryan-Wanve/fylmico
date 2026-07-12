import jwt from "jsonwebtoken";
import { requireEnv } from "../env";

interface DriveStateClaims {
  purpose: "drive_connect";
  userId: string;
}

interface DownloadTokenClaims {
  purpose: "file_download";
  entryId: string;
}

export function signDriveState(userId: string): string {
  const secret = requireEnv("JWT_ACCESS_SECRET");
  const claims: DriveStateClaims = { purpose: "drive_connect", userId };
  return jwt.sign(claims, secret, { expiresIn: "10m" });
}

export function verifyDriveState(state: string): string {
  const secret = requireEnv("JWT_ACCESS_SECRET");
  const payload = jwt.verify(state, secret) as unknown as DriveStateClaims;
  if (payload.purpose !== "drive_connect") {
    throw new Error("Invalid Drive connect state.");
  }
  return payload.userId;
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
