import { HttpStatus } from '@nestjs/common';
import { BaseHttpException, ErrorDetails } from './base.exception';

export class ForbiddenResourceException extends BaseHttpException {
  constructor(message = 'You do not have permission to access this resource', details?: ErrorDetails) {
    super(message, HttpStatus.FORBIDDEN, 'FORBIDDEN', details);
  }
}
