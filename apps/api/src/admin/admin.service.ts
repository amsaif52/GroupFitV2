import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getHealth() {
    return { division: 'admin', status: 'ok', timestamp: new Date().toISOString() };
  }
}
