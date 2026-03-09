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
      isActive?: boolean;
      allowedDays?: string | null;
      singleUsePerCustomer?: boolean;
    }
  ) {
    return this.adminService.createDiscount(
      body?.code ?? '',
      body?.type ?? 'percent',
      Number(body?.value ?? 0),
      body?.validFrom,
      body?.validTo,
      body?.isActive,
      body?.allowedDays,
      body?.singleUsePerCustomer
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
      isActive?: boolean;
      allowedDays?: string | null;
      singleUsePerCustomer?: boolean;
    }
  ) {
    return this.adminService.updateDiscount(
      body?.id ?? '',
      body?.code,
      body?.type,
      body?.value,
      body?.validFrom,
      body?.validTo,
      body?.isActive,
      body?.allowedDays,
      body?.singleUsePerCustomer
    );
  }

  @Post('deleteDiscount')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete discount' })
  deleteDiscount(@Body() body: { id?: string }) {
    return this.adminService.deleteDiscount(body?.id ?? '');
  }

  @Post('voucherListByDiscount')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'List vouchers for a discount' })
  voucherListByDiscount(@Body() body: { discountId?: string }) {
    return this.adminService.voucherListByDiscount(body?.discountId ?? '');
  }

  @Post('createVoucher')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create a voucher for a discount' })
  createVoucher(
    @Body()
    body: {
      discountId?: string;
      recipientName?: string | null;
      recipientOrg?: string | null;
    }
  ) {
    return this.adminService.createVoucher(
      body?.discountId ?? '',
      body?.recipientName,
      body?.recipientOrg
    );
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
    @CurrentUser('sub') adminUserId: string,
    @Body()
    body: {
      code?: string;
      name?: string;
      description?: string;
      defaultPriceCents?: number;
      logoUrl?: string;
      activityGroup?: string;
      trainerSharePercent?: number | null;
      status?: string | null;
    }
  ) {
    return this.adminService.createActivity(
      adminUserId,
      body?.code ?? '',
      body?.name ?? '',
      body?.description,
      body?.defaultPriceCents,
      body?.logoUrl,
      body?.activityGroup,
      body?.trainerSharePercent,
      body?.status
    );
  }

  @Post('updateActivity')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update activity type' })
  updateActivity(
    @CurrentUser('sub') adminUserId: string,
    @Body()
    body: {
      id?: string;
      code?: string;
      name?: string;
      description?: string;
      defaultPriceCents?: number | null;
      logoUrl?: string | null;
      activityGroup?: string | null;
      trainerSharePercent?: number | null;
      status?: string | null;
    }
  ) {
    return this.adminService.updateActivity(
      adminUserId,
      body?.id ?? '',
      body?.code,
      body?.name,
      body?.description,
      body?.defaultPriceCents ?? undefined,
      body?.logoUrl,
      body?.activityGroup,
      body?.trainerSharePercent,
      body?.status
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

  @Post('trainerActivityList')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'List activities for a trainer (admin)' })
  trainerActivityList(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { trainerId?: string }
  ) {
    return this.adminService.trainerActivityList(adminUserId, body?.trainerId ?? '');
  }

  @Post('addTrainerActivity')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Add activity to trainer with optional custom price (admin)' })
  addTrainerActivity(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { trainerId?: string; activityCode?: string; priceCents?: number | null }
  ) {
    return this.adminService.addTrainerActivity(
      adminUserId,
      body?.trainerId ?? '',
      body?.activityCode ?? '',
      body?.priceCents
    );
  }

  @Post('setTrainerActivityPrice')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Set custom price for trainer activity (admin)' })
  setTrainerActivityPrice(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { trainerId?: string; activityCode?: string; priceCents?: number | null }
  ) {
    return this.adminService.setTrainerActivityPrice(
      adminUserId,
      body?.trainerId ?? '',
      body?.activityCode ?? '',
      body?.priceCents ?? null
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

  @Post('createCustomer')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create customer (admin only)' })
  createCustomer(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { email?: string; name?: string; phone?: string }
  ) {
    return this.adminService.createCustomer(adminUserId, {
      email: body?.email ?? '',
      name: body?.name,
      phone: body?.phone,
    });
  }

  @Post('updateCustomer')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update customer (admin only)' })
  updateCustomer(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { customerId?: string; name?: string; phone?: string }
  ) {
    return this.adminService.updateCustomer(adminUserId, body?.customerId ?? '', {
      name: body?.name,
      phone: body?.phone,
    });
  }

  @Post('setUserActive')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Set user active/inactive (admin only)' })
  setUserActive(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { userId?: string; isActive?: boolean }
  ) {
    return this.adminService.setUserActive(
      adminUserId,
      body?.userId ?? '',
      body?.isActive ?? false
    );
  }

  @Post('createTrainer')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create trainer (admin only)' })
  createTrainer(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { email?: string; name?: string; phone?: string }
  ) {
    return this.adminService.createTrainer(adminUserId, {
      email: body?.email ?? '',
      name: body?.name,
      phone: body?.phone,
    });
  }

  @Post('updateTrainer')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update trainer (admin only)' })
  updateTrainer(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { trainerId?: string; name?: string; phone?: string }
  ) {
    return this.adminService.updateTrainer(adminUserId, body?.trainerId ?? '', {
      name: body?.name,
      phone: body?.phone,
    });
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
  createFaq(
    @Body() body: { question?: string; answer?: string; sortOrder?: number; role?: string }
  ) {
    return this.adminService.createFaq(
      body?.question ?? '',
      body?.answer ?? '',
      body?.sortOrder,
      body?.role
    );
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
      role?: string;
    }
  ) {
    return this.adminService.updateFaq(
      body?.id ?? '',
      body?.question,
      body?.answer,
      body?.sortOrder,
      body?.role
    );
  }

  @Post('deleteFaq')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete FAQ' })
  deleteFaq(@Body() body: { id?: string }) {
    return this.adminService.deleteFaq(body?.id ?? '');
  }

  @Post('miscList')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Misc list (name + type)' })
  miscList(@Body() _body: Record<string, unknown>) {
    return this.adminService.miscList();
  }

  @Post('createMisc')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create misc entry' })
  createMisc(@Body() body: { name?: string; type?: string }) {
    return this.adminService.createMisc(body?.name ?? '', body?.type ?? '');
  }

  @Post('updateMisc')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update misc entry' })
  updateMisc(@Body() body: { id?: string; name?: string; type?: string }) {
    return this.adminService.updateMisc(body?.id ?? '', body?.name, body?.type);
  }

  @Post('deleteMisc')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete misc entry' })
  deleteMisc(@Body() body: { id?: string }) {
    return this.adminService.deleteMisc(body?.id ?? '');
  }

  @Post('countryList')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Country list' })
  countryList(@Body() _body: Record<string, unknown>) {
    return this.adminService.countryList();
  }

  @Post('createCountry')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create country' })
  createCountry(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { name?: string; isdCode?: string }
  ) {
    return this.adminService.createCountry(adminUserId, {
      name: body?.name ?? '',
      isdCode: body?.isdCode ?? '',
    });
  }

  @Post('updateCountry')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update country' })
  updateCountry(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { id?: string; name?: string; isdCode?: string }
  ) {
    return this.adminService.updateCountry(adminUserId, body?.id ?? '', {
      name: body?.name,
      isdCode: body?.isdCode,
    });
  }

  @Post('deleteCountry')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete country' })
  deleteCountry(@CurrentUser('sub') adminUserId: string, @Body() body: { id?: string }) {
    return this.adminService.deleteCountry(adminUserId, body?.id ?? '');
  }

  @Post('languageList')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Language list' })
  languageList(@Body() _body: Record<string, unknown>) {
    return this.adminService.languageList();
  }

  @Post('createLanguage')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create language' })
  createLanguage(@CurrentUser('sub') adminUserId: string, @Body() body: { name?: string }) {
    return this.adminService.createLanguage(adminUserId, { name: body?.name ?? '' });
  }

  @Post('updateLanguage')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update language' })
  updateLanguage(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { id?: string; name?: string }
  ) {
    return this.adminService.updateLanguage(adminUserId, body?.id ?? '', { name: body?.name });
  }

  @Post('deleteLanguage')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete language' })
  deleteLanguage(@CurrentUser('sub') adminUserId: string, @Body() body: { id?: string }) {
    return this.adminService.deleteLanguage(adminUserId, body?.id ?? '');
  }

  @Post('stateList')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'State list' })
  stateList(@Body() _body: Record<string, unknown>) {
    return this.adminService.stateList();
  }

  @Post('createState')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create state' })
  createState(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { name?: string; countryId?: string }
  ) {
    return this.adminService.createState(adminUserId, {
      name: body?.name ?? '',
      countryId: body?.countryId,
    });
  }

  @Post('updateState')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update state' })
  updateState(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { id?: string; name?: string; countryId?: string }
  ) {
    return this.adminService.updateState(adminUserId, body?.id ?? '', {
      name: body?.name,
      countryId: body?.countryId,
    });
  }

  @Post('deleteState')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete state' })
  deleteState(@CurrentUser('sub') adminUserId: string, @Body() body: { id?: string }) {
    return this.adminService.deleteState(adminUserId, body?.id ?? '');
  }

  @Post('contactLinkList')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Contact link list' })
  contactLinkList(@Body() _body: Record<string, unknown>) {
    return this.adminService.contactLinkList();
  }

  @Post('createContactLink')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create contact link' })
  createContactLink(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { name?: string; link?: string; iconUrl?: string }
  ) {
    return this.adminService.createContactLink(adminUserId, {
      name: body?.name ?? '',
      link: body?.link ?? '',
      iconUrl: body?.iconUrl,
    });
  }

  @Post('updateContactLink')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update contact link' })
  updateContactLink(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { id?: string; name?: string; link?: string; iconUrl?: string }
  ) {
    return this.adminService.updateContactLink(adminUserId, body?.id ?? '', {
      name: body?.name,
      link: body?.link,
      iconUrl: body?.iconUrl,
    });
  }

  @Post('deleteContactLink')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete contact link' })
  deleteContactLink(@CurrentUser('sub') adminUserId: string, @Body() body: { id?: string }) {
    return this.adminService.deleteContactLink(adminUserId, body?.id ?? '');
  }

  @Post('activityCategoryList')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Activity category list' })
  activityCategoryList(@Body() _body: Record<string, unknown>) {
    return this.adminService.activityCategoryList();
  }

  @Post('createActivityCategory')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create activity category' })
  createActivityCategory(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { name?: string; iconUrl?: string }
  ) {
    return this.adminService.createActivityCategory(adminUserId, {
      name: body?.name ?? '',
      iconUrl: body?.iconUrl,
    });
  }

  @Post('updateActivityCategory')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update activity category' })
  updateActivityCategory(
    @CurrentUser('sub') adminUserId: string,
    @Body() body: { id?: string; name?: string; iconUrl?: string }
  ) {
    return this.adminService.updateActivityCategory(adminUserId, body?.id ?? '', {
      name: body?.name,
      iconUrl: body?.iconUrl,
    });
  }

  @Post('deleteActivityCategory')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete activity category' })
  deleteActivityCategory(@CurrentUser('sub') adminUserId: string, @Body() body: { id?: string }) {
    return this.adminService.deleteActivityCategory(adminUserId, body?.id ?? '');
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
