import { HttpStatus } from '@nestjs/common';
import { BaseHttpException, ErrorDetails } from './base.exception';

export class ConflictException extends BaseHttpException {
  constructor(message: string, code = 'CONFLICT', details?: ErrorDetails) {
    super(message, HttpStatus.CONFLICT, code, details);
  }
}
