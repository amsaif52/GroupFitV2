import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomerService {
  getHealth() {
    return { division: 'customer', status: 'ok', timestamp: new Date().toISOString() };
  }
}
