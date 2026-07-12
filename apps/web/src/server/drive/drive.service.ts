import { getAppUrl } from "../mail/mailer";
import { getOptionalEnv } from "../env";
import { AppException, HttpStatus } from "../http";
import { prisma } from "../prisma";
import { signDriveState, verifyDriveState } from "./drive-token.util";
import {
  buildDriveAuthUrl,
  createFylmicoFolder,
  deleteDriveFile,
  downloadDriveFile,
  exchangeDriveCode,
  fetchDriveAccountEmail,
  refreshDriveAccessToken,
  uploadDriveFile
} from "./google-drive.util";

class DriveService {
  private readonly prisma = prisma;

  private getCredentials() {
    const clientId = getOptionalEnv("GOOGLE_CLIENT_ID");
    const clientSecret = getOptionalEnv("GOOGLE_CLIENT_SECRET");
    if (!clientId || !clientSecret) {
      throw new AppException(
        HttpStatus.SERVICE_UNAVAILABLE,
        "google_oauth_not_configured",
        "Google Drive is not configured on this server."
      );
    }
    return { clientId, clientSecret };
  }

  private get callbackUrl(): string {
    return `${getAppUrl()}/api/v1/drive/callback`;
  }

  getConnectUrl(userId: string): string {
    const { clientId } = this.getCredentials();
    const state = signDriveState(userId);
    return buildDriveAuthUrl({
      clientId,
      redirectUri: this.callbackUrl,
      state
    });
  }

  async handleCallback(code: string, state: string): Promise<void> {
    const userId = verifyDriveState(state);
    const { clientId, clientSecret } = this.getCredentials();

    const tokenResponse = await exchangeDriveCode({
      code,
      clientId,
      clientSecret,
      redirectUri: this.callbackUrl
    });

    if (!tokenResponse.refresh_token) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "drive_connect_failed",
        "Google did not grant offline access - please try connecting again."
      );
    }

    const [folderId, email] = await Promise.all([
      createFylmicoFolder(tokenResponse.access_token),
      fetchDriveAccountEmail(tokenResponse.access_token)
    ]);

    await this.prisma.driveConnection.upsert({
      where: { userId },
      create: {
        userId,
        refreshToken: tokenResponse.refresh_token,
        driveFolderId: folderId,
        googleEmail: email
      },
      update: {
        refreshToken: tokenResponse.refresh_token,
        driveFolderId: folderId,
        googleEmail: email
      }
    });
  }

  async getStatus(
    userId: string
  ): Promise<{ connected: boolean; email: string | null }> {
    const connection = await this.prisma.driveConnection.findUnique({
      where: { userId }
    });
    return {
      connected: Boolean(connection),
      email: connection?.googleEmail ?? null
    };
  }

  async disconnect(userId: string): Promise<void> {
    await this.prisma.driveConnection.deleteMany({ where: { userId } });
  }

  private async getValidAccessToken(
    userId: string
  ): Promise<{ accessToken: string; folderId: string }> {
    const connection = await this.prisma.driveConnection.findUnique({
      where: { userId }
    });
    if (!connection) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "drive_not_connected",
        "Connect your Google Drive before uploading files."
      );
    }

    const { clientId, clientSecret } = this.getCredentials();
    const refreshed = await refreshDriveAccessToken({
      refreshToken: connection.refreshToken,
      clientId,
      clientSecret
    });

    return {
      accessToken: refreshed.access_token,
      folderId: connection.driveFolderId
    };
  }

  async upload(
    userId: string,
    file: { name: string; buffer: ArrayBuffer; mimeType: string }
  ): Promise<string> {
    const { accessToken, folderId } = await this.getValidAccessToken(userId);
    return uploadDriveFile({
      accessToken,
      folderId,
      name: file.name,
      mimeType: file.mimeType,
      buffer: file.buffer
    });
  }

  async download(uploaderId: string, fileId: string): Promise<Response> {
    const { accessToken } = await this.getValidAccessToken(uploaderId);
    return downloadDriveFile({ accessToken, fileId });
  }

  async remove(uploaderId: string, fileId: string): Promise<void> {
    const { accessToken } = await this.getValidAccessToken(uploaderId);
    await deleteDriveFile({ accessToken, fileId });
  }
}

export const driveService = new DriveService();
