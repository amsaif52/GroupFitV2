import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API_PREFIXES } from '@groupfit/shared';
import { TrainerService } from './trainer.service';

@ApiTags('trainer')
@Controller(API_PREFIXES.TRAINER)
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check for trainer division' })
  @ApiOkResponse({ description: 'Division is healthy' })
  health() {
    return this.trainerService.getHealth();
  }
}
