import { Injectable } from '@nestjs/common';

@Injectable()
export class TrainerService {
  getHealth() {
    return { division: 'trainer', status: 'ok', timestamp: new Date().toISOString() };
  }
}
