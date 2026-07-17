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

export async function createDriveFolder(params: {
  accessToken: string;
  name: string;
  parentFolderId?: string;
}): Promise<string> {
  const response = await fetch(
    "https://www.googleapis.com/drive/v3/files?fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: params.name,
        mimeType: "application/vnd.google-apps.folder",
        ...(params.parentFolderId ? { parents: [params.parentFolderId] } : {})
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      `Could not create the "${params.name}" folder in Google Drive (status ${response.status})`
    );
  }

  const json = (await response.json()) as { id: string };
  return json.id;
}

export async function moveDriveFile(params: {
  accessToken: string;
  fileId: string;
  addParentId: string;
  removeParentId: string;
}): Promise<void> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${params.fileId}?addParents=${params.addParentId}&removeParents=${params.removeParentId}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${params.accessToken}` }
    }
  );

  if (!response.ok) {
    throw new Error(`Google Drive move failed with status ${response.status}`);
  }
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

// Initiates a Drive resumable-upload session (uploadType=resumable) and
// returns the session URL (Drive's `Location` response header). Chunks are
// then PUT directly to that URL - see uploadResumableChunk/
// getResumableUploadStatus below - so a dropped connection or reload of
// this server process never needs to re-buffer the whole file, and a
// retry can ask Drive how many bytes it already has instead of restarting.
export async function initiateResumableUpload(params: {
  accessToken: string;
  folderId: string;
  name: string;
  mimeType: string;
  size: number;
}): Promise<string> {
  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": params.mimeType,
        "X-Upload-Content-Length": String(params.size)
      },
      body: JSON.stringify({ name: params.name, parents: [params.folderId] })
    }
  );

  if (!response.ok) {
    throw new Error(
      `Google Drive resumable-upload session could not be created (status ${response.status})`
    );
  }

  const sessionUrl = response.headers.get("location");
  if (!sessionUrl) {
    throw new Error(
      "Google Drive did not return a resumable-upload session URL."
    );
  }
  return sessionUrl;
}

export type DriveChunkResult =
  { done: false; receivedBytes: number } | { done: true; fileId: string };

function parseReceivedBytes(rangeHeader: string | null): number {
  // Drive's `Range: bytes=0-N` header reports the last byte offset it has
  // durably received - resuming means sending from N+1, not N, hence +1.
  const match = rangeHeader?.match(/bytes=\d+-(\d+)/);
  return match ? Number(match[1]) + 1 : 0;
}

export async function uploadResumableChunk(params: {
  accessToken: string;
  sessionUrl: string;
  chunk: ArrayBuffer;
  start: number;
  end: number;
  total: number;
}): Promise<DriveChunkResult> {
  const response = await fetch(params.sessionUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Length": String(params.chunk.byteLength),
      "Content-Range": `bytes ${params.start}-${params.end}/${params.total}`
    },
    body: params.chunk
  });

  if (response.status === 308) {
    return {
      done: false,
      receivedBytes: parseReceivedBytes(response.headers.get("range"))
    };
  }

  if (response.ok) {
    const json = (await response.json()) as { id: string };
    return { done: true, fileId: json.id };
  }

  throw new Error(
    `Google Drive chunk upload failed with status ${response.status}`
  );
}

// Asks Drive how many bytes of an in-progress resumable session it has
// durably received, without sending any new data - the mechanism that lets
// an upload resume after a dropped connection instead of restarting at 0%.
export async function getResumableUploadStatus(params: {
  accessToken: string;
  sessionUrl: string;
  total: number;
}): Promise<DriveChunkResult> {
  const response = await fetch(params.sessionUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Length": "0",
      "Content-Range": `bytes */${params.total}`
    }
  });

  if (response.status === 308) {
    return {
      done: false,
      receivedBytes: parseReceivedBytes(response.headers.get("range"))
    };
  }

  if (response.ok) {
    const json = (await response.json()) as { id: string };
    return { done: true, fileId: json.id };
  }

  throw new Error(
    `Google Drive upload session is no longer valid (status ${response.status})`
  );
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
