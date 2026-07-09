import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { AppException } from "../exceptions/app.exception";
import { HttpStatus } from "@nestjs/common";

export interface AuthenticatedUser {
  id: string;
  sessionId: string;
}

function extractBearerToken(request: Request): string | undefined {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }
  return header.slice("Bearer ".length);
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    const token = extractBearerToken(request);

    if (!token) {
      throw new AppException(
        HttpStatus.UNAUTHORIZED,
        "unauthenticated",
        "Authentication is required."
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        sid: string;
      }>(token);
      request.user = { id: payload.sub, sessionId: payload.sid };
      return true;
    } catch {
      throw new AppException(
        HttpStatus.UNAUTHORIZED,
        "unauthenticated",
        "Invalid or expired access token."
      );
    }
  }
}
