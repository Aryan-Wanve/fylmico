import { randomUUID } from "node:crypto";

export const DRIVE_SCOPE =
  "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email";

export function buildDriveAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", DRIVE_SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", params.state);
  return url.toString();
}

export interface DriveTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export async function exchangeDriveCode(params: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<DriveTokenResponse> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: params.code,
      client_id: params.clientId,
      client_secret: params.clientSecret,
      redirect_uri: params.redirectUri,
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    throw new Error(
      `Google Drive token exchange failed with status ${response.status}`
    );
  }

  return response.json() as Promise<DriveTokenResponse>;
}

export async function refreshDriveAccessToken(params: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}): Promise<{ access_token: string; expires_in: number }> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: params.refreshToken,
      client_id: params.clientId,
      client_secret: params.clientSecret,
      grant_type: "refresh_token"
    })
  });

  if (!response.ok) {
    throw new Error(
      `Google Drive token refresh failed with status ${response.status}`
    );
  }

  return response.json() as Promise<{
    access_token: string;
    expires_in: number;
  }>;
}

export async function fetchDriveAccountEmail(
  accessToken: string
): Promise<string | undefined> {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!response.ok) {
    return undefined;
  }
  const json = (await response.json()) as { email?: string };
  return json.email;
}

export async function createFylmicoFolder(
  accessToken: string
): Promise<string> {
  const response = await fetch(
    "https://www.googleapis.com/drive/v3/files?fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "Fylmico",
        mimeType: "application/vnd.google-apps.folder"
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      `Could not create the Fylmico folder in Google Drive (status ${response.status})`
    );
  }

  const json = (await response.json()) as { id: string };
  return json.id;
}

export async function uploadDriveFile(params: {
  accessToken: string;
  folderId: string;
  name: string;
  mimeType: string;
  buffer: ArrayBuffer;
}): Promise<string> {
  const boundary = `fylmico-${randomUUID()}`;
  const metadata = JSON.stringify({
    name: params.name,
    parents: [params.folderId]
  });

  const encoder = new TextEncoder();
  const head = encoder.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
      `--${boundary}\r\nContent-Type: ${params.mimeType}\r\n\r\n`
  );
  const tail = encoder.encode(`\r\n--${boundary}--`);
  const body = new Blob([head, params.buffer, tail]);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`
      },
      body
    }
  );

  if (!response.ok) {
    throw new Error(
      `Google Drive upload failed with status ${response.status}`
    );
  }

  const json = (await response.json()) as { id: string };
  return json.id;
}

export async function downloadDriveFile(params: {
  accessToken: string;
  fileId: string;
}): Promise<Response> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${params.fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${params.accessToken}` } }
  );

  if (!response.ok) {
    throw new Error(
      `Google Drive download failed with status ${response.status}`
    );
  }

  return response;
}

export async function deleteDriveFile(params: {
  accessToken: string;
  fileId: string;
}): Promise<void> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${params.fileId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${params.accessToken}` }
    }
  );

  // A 404 means it's already gone from Drive - fine to treat as deleted.
  if (!response.ok && response.status !== 404) {
    throw new Error(
      `Google Drive delete failed with status ${response.status}`
    );
  }
}
