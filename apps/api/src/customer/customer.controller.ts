import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { API_PREFIXES } from '@groupfit/shared';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { EditProfileDto } from '../common/dto/edit-profile.dto';

@ApiTags('customer')
@Controller(API_PREFIXES.CUSTOMER)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check for customer division' })
  health() {
    return this.customerService.getHealth();
  }

  @Post('APIVersionCheck')
  @ApiOperation({ summary: 'API version check' })
  APIVersionCheck(@Body() _body: Record<string, unknown>) {
    return this.customerService.APIVersionCheck();
  }

  @Post('viewProfile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'View customer profile (requires JWT)' })
  viewProfile(@CurrentUser('sub') userId: string) {
    return this.customerService.viewProfile(userId);
  }

  @Post('editProfile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Edit customer profile (requires JWT)' })
  editProfile(@CurrentUser('sub') userId: string, @Body() dto: EditProfileDto) {
    return this.customerService.editProfile(userId, dto);
  }

  @Post('deleteProfile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Request account deletion (contact support to complete)' })
  deleteProfile(@Body() _body: Record<string, unknown>) {
    return this.customerService.deleteProfile();
  }

  // Reference data
  @Post('countryList')
  @ApiOperation({ summary: 'Country list (stub)' })
  countryList() {
    return this.customerService.countryList();
  }

  @Post('stateList')
  @ApiOperation({ summary: 'State list (stub)' })
  stateList(@Body() _body: Record<string, unknown>) {
    return this.customerService.stateList();
  }

  @Post('citylist')
  @ApiOperation({ summary: 'City list (stub)' })
  citylist(@Body() _body: Record<string, unknown>) {
    return this.customerService.citylist();
  }

  // Groups
  @Post('fetchallgroupslist')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fetch all groups owned by current user' })
  fetchallgroupslist(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.customerService.fetchallgroupslist(userId);
  }

  @Post('addgroupname')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create group' })
  addgroupname(@CurrentUser('sub') userId: string, @Body() body: { name?: string }) {
    return this.customerService.addgroupname(userId, body?.name ?? '');
  }

  @Post('addgroupmember')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add member to group' })
  addgroupmember(
    @CurrentUser('sub') userId: string,
    @Body() body: { groupId?: string; userId?: string },
  ) {
    return this.customerService.addgroupmember(userId, body?.groupId ?? '', body?.userId ?? '');
  }

  @Post('fetchgroupMembers')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fetch group members' })
  fetchgroupMembers(
    @CurrentUser('sub') userId: string,
    @Body() body: { groupId?: string },
  ) {
    return this.customerService.fetchgroupMembers(userId, body?.groupId ?? '');
  }

  @Post('updategroupmember')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove member from group (by member id)' })
  updategroupmember(
    @CurrentUser('sub') userId: string,
    @Body() body: { groupId?: string; memberId?: string },
  ) {
    return this.customerService.updategroupmember(userId, body?.groupId ?? '', body?.memberId ?? '');
  }

  @Post('deletegrouplist')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete group' })
  deletegrouplist(
    @CurrentUser('sub') userId: string,
    @Body() body: { groupId?: string },
  ) {
    return this.customerService.deletegrouplist(userId, body?.groupId ?? '');
  }

  @Post('fetchSoloMembers')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Customers not in group (for add member); body: groupId' })
  fetchSoloMembers(@CurrentUser('sub') userId: string, @Body() body: { groupId?: string }) {
    return this.customerService.fetchSoloMembers(userId, body?.groupId);
  }

  // Referral
  @Post('ReferralList')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Referral list (people referred by current user)' })
  ReferralList(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.customerService.ReferralList(userId);
  }

  @Post('referraldetails')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Referral detail by id (referrer must be current user)' })
  referraldetails(@CurrentUser('sub') userId: string, @Body() body: { referralId?: string }) {
    return this.customerService.referraldetails(userId, body?.referralId ?? '');
  }

  // Sessions
  @Post('customerSessionList')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Customer upcoming sessions' })
  customerSessionList(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.customerService.customerSessionList(userId);
  }

  @Post('customerSessionCompletedList')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Customer completed sessions' })
  customerSessionCompletedList(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.customerService.customerSessionCompletedList(userId);
  }

  @Post('todaysessionlist')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Today session list' })
  todaysessionlist(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.customerService.todaysessionlist(userId);
  }

  @Post('ViewSession')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'View session (same as fetchSessionDetails)' })
  ViewSession(@CurrentUser('sub') userId: string, @Body() body: { sessionId?: string }) {
    return this.customerService.ViewSession(userId, body?.sessionId ?? '');
  }

  @Post('fetchSessionDetails')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fetch session details' })
  fetchSessionDetails(@CurrentUser('sub') userId: string, @Body() body: { sessionId?: string }) {
    return this.customerService.fetchSessionDetails(userId, body?.sessionId ?? '');
  }

  @Post('cancelSession')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel session' })
  cancelSession(@CurrentUser('sub') userId: string, @Body() body: { sessionId?: string; cancelReason?: string }) {
    return this.customerService.cancelSession(userId, body?.sessionId ?? '', body?.cancelReason);
  }

  @Post('rescheduleSession')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reschedule session' })
  rescheduleSession(@CurrentUser('sub') userId: string, @Body() body: { sessionId?: string; newScheduledAt?: string }) {
    return this.customerService.rescheduleSession(userId, body?.sessionId ?? '', body?.newScheduledAt ?? '');
  }

  @Post('fetchcancelreason')
  @ApiOperation({ summary: 'Cancel reasons list' })
  fetchcancelreason() {
    return this.customerService.fetchcancelreason();
  }

  @Post('SessionTrainersList')
  @ApiOperation({ summary: 'List trainers (for session booking)' })
  SessionTrainersList(@Body() _body: Record<string, unknown>) {
    return this.customerService.SessionTrainersList();
  }

  @Post('CheckTrainerAvailability')
  @ApiOperation({ summary: 'Check if trainer is available at date/time' })
  CheckTrainerAvailability(@Body() body: { trainerId?: string; date?: string; time?: string }) {
    return this.customerService.CheckTrainerAvailability(body?.trainerId ?? '', body?.date, body?.time);
  }

  @Post('SessionAvailabilityDateList')
  @ApiOperation({ summary: 'Dates when trainer has availability' })
  SessionAvailabilityDateList(@Body() body: { trainerId?: string; limit?: number }) {
    return this.customerService.SessionAvailabilityDateList(body?.trainerId ?? '', body?.limit);
  }

  @Post('SessionAvailabilityTimeList')
  @ApiOperation({ summary: 'Time slots available for trainer on a date' })
  SessionAvailabilityTimeList(@Body() body: { trainerId?: string; date?: string }) {
    return this.customerService.SessionAvailabilityTimeList(body?.trainerId ?? '', body?.date ?? '');
  }

  @Post('addSession')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Book a session' })
  addSession(@CurrentUser('sub') userId: string, @Body() body: { trainerId?: string; scheduledAt?: string; activityName?: string }) {
    return this.customerService.addSession(userId, body?.trainerId ?? '', body?.scheduledAt ?? '', body?.activityName);
  }

  // Activities
  @Post('fetchactivitytype')
  @ApiOperation({ summary: 'Fetch activity types (stub)' })
  fetchactivitytype() {
    return this.customerService.fetchactivitytype();
  }

  @Post('fetchAllActivity')
  @ApiOperation({ summary: 'Fetch all activities (stub)' })
  fetchAllActivity(@Body() _body: Record<string, unknown>) {
    return this.customerService.fetchAllActivity();
  }

  @Post('viewActivity')
  @ApiOperation({ summary: 'View activity' })
  viewActivity(@Body() body: { activityId?: string }) {
    return this.customerService.viewActivity(body?.activityId);
  }

  @Post('fetchFavouriteActivities')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fetch favourite activities' })
  fetchFavouriteActivities(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.customerService.fetchFavouriteActivities(userId);
  }

  @Post('addFavouriteActivity')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add favourite activity' })
  addFavouriteActivity(@CurrentUser('sub') userId: string, @Body() body: { activityCode?: string }) {
    return this.customerService.addFavouriteActivity(userId, body?.activityCode ?? '');
  }

  @Post('removeFavouriteActivity')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove favourite activity' })
  removeFavouriteActivity(@CurrentUser('sub') userId: string, @Body() body: { activityCode?: string }) {
    return this.customerService.removeFavouriteActivity(userId, body?.activityCode ?? '');
  }

  @Post('customerActivityList')
  @ApiOperation({ summary: 'Activity list (same shape as fetchAllActivity)' })
  customerActivityList(@Body() _body: Record<string, unknown>) {
    return this.customerService.customerActivityList();
  }

  @Post('GetTrendingActivities')
  @ApiOperation({ summary: 'Trending activities (stub)' })
  GetTrendingActivities() {
    return this.customerService.GetTrendingActivities();
  }

  // Trainers
  @Post('viewTrainer')
  @ApiOperation({ summary: 'View trainer' })
  viewTrainer(@Body() body: { trainerId?: string }) {
    return this.customerService.viewTrainer(body?.trainerId ?? '');
  }

  @Post('topratedTrainersList')
  @ApiOperation({ summary: 'Top rated trainers (stub)' })
  topratedTrainersList(@Body() _body: Record<string, unknown>) {
    return this.customerService.topratedTrainersList();
  }

  @Post('favouriteTrainersList')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Favourite trainers list' })
  favouriteTrainersList(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.customerService.favouriteTrainersList(userId);
  }

  @Post('fetchFavouriteTrainers')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fetch favourite trainers' })
  fetchFavouriteTrainers(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.customerService.fetchFavouriteTrainers(userId);
  }

  @Post('addFavouriteTrainer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add favourite trainer' })
  addFavouriteTrainer(@CurrentUser('sub') userId: string, @Body() body: { trainerId?: string }) {
    return this.customerService.addFavouriteTrainer(userId, body?.trainerId ?? '');
  }

  @Post('deletefavouriteTrainer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove favourite trainer' })
  deletefavouriteTrainer(@CurrentUser('sub') userId: string, @Body() body: { trainerId?: string }) {
    return this.customerService.deletefavouriteTrainer(userId, body?.trainerId ?? '');
  }

  @Post('getTrainerAvgRating')
  @ApiOperation({ summary: 'Trainer average rating; body: trainerId' })
  getTrainerAvgRating(@Body() body: { trainerId?: string }) {
    return this.customerService.getTrainerAvgRating(body?.trainerId ?? '');
  }

  @Post('fetchTrainerRelatedReviews')
  @ApiOperation({ summary: 'Reviews for a trainer; body: trainerId' })
  fetchTrainerRelatedReviews(@Body() body: { trainerId?: string }) {
    return this.customerService.fetchTrainerRelatedReviews(body?.trainerId ?? '');
  }

  // Service area / locations (CustomerLocation; JWT required)
  @Post('customerServiceList')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List customer saved locations' })
  customerServiceList(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.customerService.customerServiceList(userId);
  }

  @Post('addCustomerService')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add saved location; body: label, address?, latitude?, longitude?' })
  addCustomerService(
    @CurrentUser('sub') userId: string,
    @Body() body: { label?: string; address?: string | null; latitude?: number | null; longitude?: number | null },
  ) {
    return this.customerService.addCustomerService(
      userId,
      body?.label ?? '',
      body?.address,
      body?.latitude,
      body?.longitude,
    );
  }

  @Post('viewServiceArea')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'View one location; body: locationId' })
  viewServiceArea(@CurrentUser('sub') userId: string, @Body() body: { locationId?: string }) {
    return this.customerService.viewServiceArea(userId, body?.locationId ?? '');
  }

  @Post('editCustomerService')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Edit location; body: locationId, label?, address?, latitude?, longitude?' })
  editCustomerService(
    @CurrentUser('sub') userId: string,
    @Body() body: {
      locationId?: string;
      label?: string;
      address?: string | null;
      latitude?: number | null;
      longitude?: number | null;
    },
  ) {
    return this.customerService.editCustomerService(
      userId,
      body?.locationId ?? '',
      body?.label,
      body?.address,
      body?.latitude,
      body?.longitude,
    );
  }

  @Post('deleteCustomerService')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete location; body: locationId' })
  deleteCustomerService(@CurrentUser('sub') userId: string, @Body() body: { locationId?: string }) {
    return this.customerService.deleteCustomerService(userId, body?.locationId ?? '');
  }

  // Payments
  @Post('PaymentList')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Payment list (sessions with payment; requires JWT)' })
  PaymentList(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.customerService.PaymentList(userId);
  }

  @Post('PaymentStatus')
  @ApiOperation({ summary: 'Payment status; body: paymentIntentId (Stripe when STRIPE_SECRET_KEY set)' })
  PaymentStatus(@Body() body: { paymentIntentId?: string }) {
    return this.customerService.PaymentStatus(body?.paymentIntentId);
  }

  @Post('PaymentSheet')
  @ApiOperation({ summary: 'Create PaymentIntent; body: amountCents?, currency? (Stripe when STRIPE_SECRET_KEY set)' })
  PaymentSheet(@Body() body: { amountCents?: number; currency?: string }) {
    return this.customerService.PaymentSheet(body?.amountCents, body?.currency);
  }

  @Post('sessionPayment')
  @ApiOperation({ summary: 'Confirm/link payment; body: sessionId?, paymentIntentId?' })
  sessionPayment(@Body() body: { sessionId?: string; paymentIntentId?: string }) {
    return this.customerService.sessionPayment(body?.sessionId, body?.paymentIntentId);
  }

  // Notifications
  @Post('GetNotificationList')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Notification list' })
  GetNotificationList(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.customerService.GetNotificationList(userId);
  }

  @Post('GetNotificationFlag')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Notification unread count' })
  GetNotificationFlag(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.customerService.GetNotificationFlag(userId);
  }

  @Post('UpdateNotificationReadStatus')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark notification(s) as read' })
  UpdateNotificationReadStatus(@CurrentUser('sub') userId: string, @Body() body: { notificationId?: string }) {
    return this.customerService.UpdateNotificationReadStatus(userId, body?.notificationId);
  }

  @Post('deleteNotification')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete notification' })
  deleteNotification(@CurrentUser('sub') userId: string, @Body() body: { notificationId?: string }) {
    return this.customerService.deleteNotification(userId, body?.notificationId ?? '');
  }

  // FAQ / Help
  @Post('faqlist')
  @ApiOperation({ summary: 'FAQ list (stub)' })
  faqlist() {
    return this.customerService.faqlist();
  }

  @Post('fetchContactLink')
  @ApiOperation({ summary: 'Contact link (stub)' })
  fetchContactLink() {
    return this.customerService.fetchContactLink();
  }

  // Reviews
  @Post('customerreview')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit review for a trainer' })
  customerreview(
    @CurrentUser('sub') userId: string,
    @Body() body: { trainerId?: string; rating?: number; comment?: string | null; sessionId?: string | null },
  ) {
    return this.customerService.customerreview(
      userId,
      body?.trainerId ?? '',
      Number(body?.rating ?? 0),
      body?.comment,
      body?.sessionId,
    );
  }

  @Post('reviewlist')
  @ApiOperation({ summary: 'Reviews for trainer; body: trainerId' })
  reviewlist(@Body() body: { trainerId?: string }) {
    return this.customerService.reviewlist(body?.trainerId);
  }

  // Discount
  @Post('avialableDiscountList')
  @ApiOperation({ summary: 'List discounts valid now (validFrom/validTo)' })
  avialableDiscountList(@Body() _body: Record<string, unknown>) {
    return this.customerService.avialableDiscountList();
  }

  @Post('checkDiscount')
  @ApiOperation({ summary: 'Validate discount code; body: code' })
  checkDiscount(@Body() body: { code?: string }) {
    return this.customerService.checkDiscount(body?.code);
  }

  // File
  @Post('fileUpload')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'File upload (stub; returns empty profilepath/filecode)' })
  @ApiBody({ schema: { type: 'object', description: 'Form data with file' } })
  fileUpload(@Body() _body: Record<string, unknown>) {
    return this.customerService.fileUpload();
  }

  // Misc
  @Post('contactList')
  @ApiOperation({ summary: 'Contact list (stub)' })
  contactList(@Body() _body: Record<string, unknown>) {
    return this.customerService.contactList();
  }

  @Post('GroupInvite')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Invite user to group; body: groupId, userId (same as addgroupmember)' })
  GroupInvite(
    @CurrentUser('sub') userId: string,
    @Body() body: { groupId?: string; userId?: string },
  ) {
    return this.customerService.GroupInvite(userId, body?.groupId, body?.userId);
  }

  @Post('raiseSupport')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create support ticket' })
  raiseSupport(@CurrentUser('sub') userId: string, @Body() body: { subject?: string; message?: string }) {
    return this.customerService.raiseSupport(userId, body?.subject ?? '', body?.message ?? '');
  }

  @Post('otherConcern')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit other concern as support ticket; body: subject?, message' })
  otherConcern(
    @CurrentUser('sub') userId: string,
    @Body() body: { subject?: string; message?: string },
  ) {
    return this.customerService.otherConcern(userId, body?.subject, body?.message);
  }
}
