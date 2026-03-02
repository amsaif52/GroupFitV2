import { HttpStatus } from '@nestjs/common';
import { BaseHttpException, ErrorDetails } from './base.exception';

export class BusinessRuleException extends BaseHttpException {
  constructor(message: string, code = 'BUSINESS_RULE_VIOLATION', details?: ErrorDetails) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, code, details);
  }
}
