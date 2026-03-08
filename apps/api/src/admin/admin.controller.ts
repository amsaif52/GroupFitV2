import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API_PREFIXES } from '../common/constants';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';

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

  @Post('dashboard')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Dashboard data (user counts)' })
  dashboard(@Body() _body: Record<string, unknown>) {
    return this.adminService.dashboard();
  }

  @Post('usersList')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Users list (all users)' })
  usersList(@Body() _body: Record<string, unknown>) {
    return this.adminService.usersList();
  }

  @Post('userDetail')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'User detail by id' })
  userDetail(@Body() body: { userId?: string }) {
    return this.adminService.userDetail(body?.userId ?? '');
  }

  @Post('trainerList')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Trainer list (users with role trainer)' })
  trainerList(@Body() _body: Record<string, unknown>) {
    return this.adminService.trainerList();
  }

  @Post('customerList')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Customer list (users with role customer)' })
  customerList(@Body() _body: Record<string, unknown>) {
    return this.adminService.customerList();
  }

  @Post('sessionList')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Session list' })
  sessionList(@Body() _body: Record<string, unknown>) {
    return this.adminService.sessionList();
  }

  @Post('sessionDetail')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Session detail by id' })
  sessionDetail(@Body() body: { sessionId?: string }) {
    return this.adminService.sessionDetail(body?.sessionId ?? '');
  }

  @Post('supportList')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Support list' })
  supportList(@Body() _body: Record<string, unknown>) {
    return this.adminService.supportList();
  }

  @Post('supportDetail')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Support ticket detail by id' })
  supportDetail(@Body() body: { supportId?: string }) {
    return this.adminService.supportDetail(body?.supportId ?? '');
  }

  @Post('discountList')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Discount list' })
  discountList(@Body() _body: Record<string, unknown>) {
    return this.adminService.discountList();
  }

  @Post('discountDetail')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Discount detail by id' })
  discountDetail(@Body() body: { discountId?: string }) {
    return this.adminService.discountDetail(body?.discountId ?? '');
  }

  @Post('createDiscount')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create discount' })
  createDiscount(
    @Body()
    body: {
      code?: string;
      type?: string;
      value?: number;
      validFrom?: string | null;
      validTo?: string | null;
    }
  ) {
    return this.adminService.createDiscount(
      body?.code ?? '',
      body?.type ?? 'percent',
      Number(body?.value ?? 0),
      body?.validFrom,
      body?.validTo
    );
  }

  @Post('updateDiscount')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update discount' })
  updateDiscount(
    @Body()
    body: {
      id?: string;
      code?: string;
      type?: string;
      value?: number;
      validFrom?: string | null;
      validTo?: string | null;
    }
  ) {
    return this.adminService.updateDiscount(
      body?.id ?? '',
      body?.code,
      body?.type,
      body?.value,
      body?.validFrom,
      body?.validTo
    );
  }

  @Post('deleteDiscount')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete discount' })
  deleteDiscount(@Body() body: { id?: string }) {
    return this.adminService.deleteDiscount(body?.id ?? '');
  }

  @Post('earningReport')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Earning report (stub)' })
  earningReport(@Body() _body: Record<string, unknown>) {
    return this.adminService.earningReport();
  }

  @Post('activityList')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Activity types list' })
  activityList(@Body() _body: Record<string, unknown>) {
    return this.adminService.activityList();
  }

  @Post('createActivity')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create activity type' })
  createActivity(
    @Body() body: { code?: string; name?: string; description?: string; defaultPriceCents?: number }
  ) {
    return this.adminService.createActivity(
      body?.code ?? '',
      body?.name ?? '',
      body?.description,
      body?.defaultPriceCents
    );
  }

  @Post('updateActivity')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update activity type' })
  updateActivity(
    @Body()
    body: {
      id?: string;
      code?: string;
      name?: string;
      description?: string;
      defaultPriceCents?: number | null;
    }
  ) {
    return this.adminService.updateActivity(
      body?.id ?? '',
      body?.code,
      body?.name,
      body?.description,
      body?.defaultPriceCents ?? undefined
    );
  }

  @Post('setTrainerCanSetOwnPrice')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Toggle trainer can set own activity price' })
  setTrainerCanSetOwnPrice(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { trainerId?: string; canSetOwnPrice?: boolean }
  ) {
    return this.adminService.setTrainerCanSetOwnPrice(
      adminUserId,
      body?.trainerId ?? '',
      !!body?.canSetOwnPrice
    );
  }

  @Post('deleteActivity')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete activity type' })
  deleteActivity(@Body() body: { id?: string }) {
    return this.adminService.deleteActivity(body?.id ?? '');
  }

  @Post('updateUserRole')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update user role (admin only)' })
  updateUserRole(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { userId?: string; role?: string }
  ) {
    return this.adminService.updateUserRole(adminUserId, body?.userId ?? '', body?.role ?? '');
  }

  @Post('DeleteAccount')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete user account (admin only)' })
  DeleteAccount(@CurrentUser('sub') adminUserId: string, @Body() body: { userId?: string }) {
    return this.adminService.deleteUser(adminUserId, body?.userId ?? '');
  }

  @Post('faqList')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'FAQ list from DB' })
  faqList(@Body() _body: Record<string, unknown>) {
    return this.adminService.faqList();
  }

  @Post('createFaq')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create FAQ' })
  createFaq(@Body() body: { question?: string; answer?: string; sortOrder?: number }) {
    return this.adminService.createFaq(body?.question ?? '', body?.answer ?? '', body?.sortOrder);
  }

  @Post('updateFaq')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update FAQ' })
  updateFaq(
    @Body()
    body: {
      id?: string;
      question?: string;
      answer?: string;
      sortOrder?: number;
    }
  ) {
    return this.adminService.updateFaq(
      body?.id ?? '',
      body?.question,
      body?.answer,
      body?.sortOrder
    );
  }

  @Post('deleteFaq')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete FAQ' })
  deleteFaq(@Body() body: { id?: string }) {
    return this.adminService.deleteFaq(body?.id ?? '');
  }

  @Post('contactUs')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Get contact email (DB or env)' })
  contactUs(@Body() _body: Record<string, unknown>) {
    return this.adminService.contactUs();
  }

  @Post('updateContactUs')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update contact email' })
  updateContactUs(@Body() body: { contactEmail?: string }) {
    return this.adminService.updateContactUs(body?.contactEmail ?? '');
  }

  @Post('getCustomizeDashboard')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Get dashboard layout/config JSON' })
  getCustomizeDashboard(@Body() _body: Record<string, unknown>) {
    return this.adminService.getCustomizeDashboard();
  }

  @Post('setCustomizeDashboard')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Save dashboard layout/config JSON' })
  setCustomizeDashboard(@Body() body: { data?: Record<string, unknown> }) {
    return this.adminService.setCustomizeDashboard(body?.data ?? {});
  }
}
