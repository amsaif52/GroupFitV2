import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/**
 * Declares common error responses for Swagger. Use on controllers or methods.
 */
export function ApiErrorResponses(...responses: { status: number; description: string }[]) {
  return applyDecorators(
    ...responses.map(({ status, description }) =>
      ApiResponse({ status, description }),
    ),
  );
}

/** Predefined set: 404 + 500 for read-one endpoints */
export const ApiErrorsNotFound = () =>
  ApiErrorResponses(
    { status: 404, description: 'Resource not found' },
    { status: 500, description: 'Internal server error' },
  );

/** Predefined set: 400 + 409 + 422 + 500 for create/update endpoints */
export const ApiErrorsValidation = () =>
  ApiErrorResponses(
    { status: 400, description: 'Bad request / invalid input' },
    { status: 409, description: 'Conflict (e.g. duplicate)' },
    { status: 422, description: 'Business rule violation' },
    { status: 500, description: 'Internal server error' },
  );

/** Predefined set: 403 + 404 + 500 for protected resources */
export const ApiErrorsForbidden = () =>
  ApiErrorResponses(
    { status: 403, description: 'Forbidden' },
    { status: 404, description: 'Resource not found' },
    { status: 500, description: 'Internal server error' },
  );
