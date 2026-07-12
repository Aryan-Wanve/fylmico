import { apiRequest } from "@/lib/api/client";

export interface DriveStatus {
  connected: boolean;
  email: string | null;
}

export async function getDriveStatus(): Promise<DriveStatus> {
  return apiRequest<DriveStatus>("/drive/status");
}

export async function getDriveConnectUrl(): Promise<string> {
  const { url } = await apiRequest<{ url: string }>("/drive/connect-url");
  return url;
}

export async function disconnectDrive(): Promise<void> {
  await apiRequest<{ success: boolean }>("/drive/disconnect", {
    method: "DELETE"
  });
}
