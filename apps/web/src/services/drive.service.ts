import { apiRequest } from "@/lib/api/client";
import { getActiveHouseId } from "./base-workspace.service";

export interface DriveStatus {
  connected: boolean;
  email: string | null;
}

function requireHouseId(): string {
  const houseId = getActiveHouseId();
  if (!houseId) {
    throw new Error("Join or create a house before using Google Drive.");
  }
  return houseId;
}

export async function getDriveStatus(): Promise<DriveStatus> {
  return apiRequest<DriveStatus>(`/houses/${requireHouseId()}/drive/status`);
}

export async function getDriveConnectUrl(): Promise<string> {
  const { url } = await apiRequest<{ url: string }>(
    `/houses/${requireHouseId()}/drive/connect-url`
  );
  return url;
}

export async function disconnectDrive(): Promise<void> {
  await apiRequest<{ success: boolean }>(
    `/houses/${requireHouseId()}/drive/disconnect`,
    { method: "DELETE" }
  );
}
