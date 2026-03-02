import { HttpStatus } from '@nestjs/common';
import { BaseHttpException, ErrorDetails } from './base.exception';

export class EntityNotFoundException extends BaseHttpException {
  constructor(
    entityName: string,
    identifier?: string | number | ErrorDetails,
    message?: string,
  ) {
    const details: ErrorDetails =
      typeof identifier === 'object' && identifier !== null && !(identifier instanceof Error)
        ? identifier
        : identifier !== undefined
          ? { id: identifier }
          : {};
    super(
      message ?? `${entityName} not found`,
      HttpStatus.NOT_FOUND,
      'ENTITY_NOT_FOUND',
      Object.keys(details).length > 0 ? details : undefined,
    );
  }
}
