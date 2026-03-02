import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API_PREFIXES } from '@groupfit/shared';
import { CustomerService } from './customer.service';

@ApiTags('customer')
@Controller(API_PREFIXES.CUSTOMER)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check for customer division' })
  @ApiOkResponse({ description: 'Division is healthy' })
  health() {
    return this.customerService.getHealth();
  }
}
