import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from "@nestjs/common";
import type { Response } from "express";
import { randomUUID } from "node:crypto";

interface ErrorPayload {
  code: string;
  message: string;
}

function toErrorPayload(exception: HttpException): ErrorPayload {
  const response = exception.getResponse();

  if (typeof response === "string") {
    return { code: "error", message: response };
  }

  const body = response as { code?: string; message?: string | string[] };
  const message = Array.isArray(body.message)
    ? body.message.join(", ")
    : (body.message ?? exception.message);

  return { code: body.code ?? "error", message };
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const { code, message } = toErrorPayload(exception);

    response.status(status).json({
      error: {
        code,
        message,
        requestId: randomUUID()
      }
    });
  }
}
