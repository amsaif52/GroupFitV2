import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API_PREFIXES } from '@groupfit/shared';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller(API_PREFIXES.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check for admin division' })
  @ApiOkResponse({ description: 'Division is healthy' })
  health() {
    return this.adminService.getHealth();
  }
}
