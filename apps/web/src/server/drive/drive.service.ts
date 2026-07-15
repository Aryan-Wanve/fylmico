import { getAppUrl } from "../mail/mailer";
import { getOptionalEnv } from "../env";
import { AppException, HttpStatus } from "../http";
import { organizationsService } from "../organizations/organizations.service";
import { prisma } from "../prisma";
import { signDriveState, verifyDriveState } from "./drive-token.util";
import {
  buildDriveAuthUrl,
  createDriveFolder,
  deleteDriveFile,
  downloadDriveFile,
  exchangeDriveCode,
  fetchDriveAccountEmail,
  moveDriveFile,
  refreshDriveAccessToken,
  uploadDriveFile
} from "./google-drive.util";

const VISIBLE_ROOT_NAME = "FYLMICO House";
const SENSITIVE_ROOT_NAME = "FYLMICO House (Sensitive)";

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

  async getConnectUrl(organizationId: string, userId: string): Promise<string> {
    await organizationsService.requireOwnerRole(
      organizationId,
      userId,
      "connect Google Drive"
    );
    const { clientId } = this.getCredentials();
    const state = signDriveState(organizationId, userId);
    return buildDriveAuthUrl({
      clientId,
      redirectUri: this.callbackUrl,
      state
    });
  }

  async handleCallback(
    code: string,
    state: string
  ): Promise<{ organizationId: string }> {
    const { organizationId, userId } = verifyDriveState(state);
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

    const [visibleRootFolderId, sensitiveRootFolderId, email] =
      await Promise.all([
        createDriveFolder({
          accessToken: tokenResponse.access_token,
          name: VISIBLE_ROOT_NAME
        }),
        createDriveFolder({
          accessToken: tokenResponse.access_token,
          name: SENSITIVE_ROOT_NAME
        }),
        fetchDriveAccountEmail(tokenResponse.access_token)
      ]);

    await this.prisma.driveConnection.upsert({
      where: { organizationId },
      create: {
        organizationId,
        connectedById: userId,
        refreshToken: tokenResponse.refresh_token,
        googleEmail: email,
        visibleRootFolderId,
        sensitiveRootFolderId
      },
      update: {
        connectedById: userId,
        refreshToken: tokenResponse.refresh_token,
        googleEmail: email,
        visibleRootFolderId,
        sensitiveRootFolderId
      }
    });

    return { organizationId };
  }

  async getStatus(
    organizationId: string
  ): Promise<{ connected: boolean; email: string | null }> {
    const connection = await this.prisma.driveConnection.findUnique({
      where: { organizationId }
    });
    return {
      connected: Boolean(connection),
      email: connection?.googleEmail ?? null
    };
  }

  async disconnect(organizationId: string, userId: string): Promise<void> {
    await organizationsService.requireOwnerRole(
      organizationId,
      userId,
      "disconnect Google Drive"
    );
    await this.prisma.driveConnection.deleteMany({ where: { organizationId } });
    await this.prisma.fileEntry.deleteMany({
      where: { organizationId, driveKey: { not: null } }
    });
  }

  async getRootFolderIds(
    organizationId: string
  ): Promise<{ visibleRootFolderId: string; sensitiveRootFolderId: string }> {
    const connection = await this.requireConnection(organizationId);
    return {
      visibleRootFolderId: connection.visibleRootFolderId,
      sensitiveRootFolderId: connection.sensitiveRootFolderId
    };
  }

  private async requireConnection(organizationId: string) {
    const connection = await this.prisma.driveConnection.findUnique({
      where: { organizationId }
    });
    if (!connection) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        "drive_not_connected",
        "Connect this house's Google Drive before uploading files."
      );
    }
    return connection;
  }

  private async getValidAccessToken(organizationId: string): Promise<string> {
    const connection = await this.requireConnection(organizationId);
    const { clientId, clientSecret } = this.getCredentials();
    const refreshed = await refreshDriveAccessToken({
      refreshToken: connection.refreshToken,
      clientId,
      clientSecret
    });
    return refreshed.access_token;
  }

  async upload(
    organizationId: string,
    file: { name: string; buffer: ArrayBuffer; mimeType: string },
    parentFolderId: string
  ): Promise<string> {
    const accessToken = await this.getValidAccessToken(organizationId);
    return uploadDriveFile({
      accessToken,
      folderId: parentFolderId,
      name: file.name,
      mimeType: file.mimeType,
      buffer: file.buffer
    });
  }

  async createFolder(
    organizationId: string,
    name: string,
    parentFolderId?: string
  ): Promise<string> {
    const accessToken = await this.getValidAccessToken(organizationId);
    return createDriveFolder({ accessToken, name, parentFolderId });
  }

  async moveFolder(
    organizationId: string,
    fileId: string,
    addParentId: string,
    removeParentId: string
  ): Promise<void> {
    const accessToken = await this.getValidAccessToken(organizationId);
    await moveDriveFile({ accessToken, fileId, addParentId, removeParentId });
  }

  async download(organizationId: string, fileId: string): Promise<Response> {
    const accessToken = await this.getValidAccessToken(organizationId);
    return downloadDriveFile({ accessToken, fileId });
  }

  async remove(organizationId: string, fileId: string): Promise<void> {
    const accessToken = await this.getValidAccessToken(organizationId);
    await deleteDriveFile({ accessToken, fileId });
  }
}

export const driveService = new DriveService();
