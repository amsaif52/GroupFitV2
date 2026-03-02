import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorDetails {
  [key: string]: unknown;
}

/**
 * Base exception with optional code and details for consistent API error responses.
 */
export class BaseHttpException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly code?: string,
    public readonly details?: ErrorDetails,
  ) {
    super(
      {
        statusCode,
        code: code ?? getDefaultCode(statusCode),
        message,
        ...(details && Object.keys(details).length > 0 && { details }),
      },
      statusCode,
    );
  }
}

function getDefaultCode(status: HttpStatus): string {
  const map: Partial<Record<HttpStatus, string>> = {
    [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
    [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
    [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
    [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
    [HttpStatus.CONFLICT]: 'CONFLICT',
    [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
  };
  return map[status] ?? 'ERROR';
}
