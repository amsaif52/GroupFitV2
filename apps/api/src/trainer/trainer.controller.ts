import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { API_PREFIXES } from '@groupfit/shared';
import { TrainerService } from './trainer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { EditProfileDto } from '../common/dto/edit-profile.dto';

@ApiTags('trainer')
@Controller(API_PREFIXES.TRAINER)
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check for trainer division' })
  health() {
    return this.trainerService.getHealth();
  }

  @Post('APIVersionCheck')
  @ApiOperation({ summary: 'API version check' })
  APIVersionCheck(@Body() _body: Record<string, unknown>) {
    return this.trainerService.APIVersionCheck();
  }

  @Post('viewProfile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'View trainer profile (requires JWT)' })
  viewProfile(@CurrentUser('sub') userId: string) {
    return this.trainerService.viewProfile(userId);
  }

  @Post('editProfile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Edit trainer profile (requires JWT)' })
  editProfile(@CurrentUser('sub') userId: string, @Body() dto: EditProfileDto) {
    return this.trainerService.editProfile(userId, dto);
  }

  @Post('deleteProfile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Request account deletion (contact support to complete)' })
  deleteProfile(@Body() _body: Record<string, unknown>) {
    return this.trainerService.deleteProfile();
  }

  @Post('basicdetails')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Basic profile (same as viewProfile for legacy clients)' })
  basicdetails(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.trainerService.basicdetails(userId);
  }

  @Post('saveSocialLinks')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Save social links (stub; no persistence yet)' })
  saveSocialLinks(
    @CurrentUser('sub') userId: string,
    @Body() body: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string }
  ) {
    return this.trainerService.saveSocialLinks(userId, body ?? {});
  }

  @Post('getSocialLinks')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get social links (stub; empty until storage added)' })
  getSocialLinks(@Body() _body: Record<string, unknown>) {
    return this.trainerService.getSocialLinks();
  }

  @Post('convertRequiredTimeFormat')
  @ApiOperation({ summary: 'Legacy: normalize time string to HH:mm' })
  convertRequiredTimeFormat(@Body() body: { time?: string; timeStr?: string }) {
    return this.trainerService.convertRequiredTimeFormat(body ?? {});
  }

  @Post('countryList')
  @ApiOperation({ summary: 'Country list (stub)' })
  countryList() {
    return this.trainerService.countryList();
  }

  @Post('stateList')
  @ApiOperation({ summary: 'State list (stub)' })
  stateList(@Body() _body: Record<string, unknown>) {
    return this.trainerService.stateList();
  }

  @Post('citylist')
  @ApiOperation({ summary: 'City list (stub)' })
  citylist(@Body() _body: Record<string, unknown>) {
    return this.trainerService.citylist();
  }

  @Post('languageList')
  @ApiOperation({ summary: 'Language list (stub)' })
  languageList() {
    return this.trainerService.languageList();
  }

  @Post('fetchExperienceList')
  @ApiOperation({ summary: 'Experience list (stub)' })
  fetchExperienceList() {
    return this.trainerService.fetchExperienceList();
  }

  @Post('allActivityList')
  @ApiOperation({ summary: 'All activity types (master data)' })
  allActivityList(@Body() _body: Record<string, unknown>) {
    return this.trainerService.allActivityList();
  }

  @Post('trainerActivityList')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Activities offered by current trainer' })
  trainerActivityList(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.trainerService.trainerActivityList(userId);
  }

  @Post('addTrainerActivity')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add activity to trainer' })
  addTrainerActivity(
    @CurrentUser('sub') userId: string,
    @Body() body: { activityCode?: string; priceCents?: number }
  ) {
    return this.trainerService.addTrainerActivity(
      userId,
      body?.activityCode ?? '',
      body?.priceCents
    );
  }

  @Post('editTrainerActivity')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Edit trainer activity' })
  editTrainerActivity(
    @CurrentUser('sub') userId: string,
    @Body() body: { id?: string; activityCode?: string; priceCents?: number | null }
  ) {
    return this.trainerService.editTrainerActivity(
      userId,
      body?.id ?? '',
      body?.activityCode,
      body?.priceCents
    );
  }

  @Post('viewActivity')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'View one trainer activity by id' })
  viewActivity(@CurrentUser('sub') userId: string, @Body() body: { id?: string }) {
    return this.trainerService.viewActivity(userId, body?.id ?? '');
  }

  @Post('deleteActivity')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove activity from trainer' })
  deleteActivity(@CurrentUser('sub') userId: string, @Body() body: { id?: string }) {
    return this.trainerService.deleteActivity(userId, body?.id ?? '');
  }

  @Post('trainerAvailabilityList')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Trainer availability list' })
  trainerAvailabilityList(
    @CurrentUser('sub') userId: string,
    @Body() _body: Record<string, unknown>
  ) {
    return this.trainerService.trainerAvailabilityList(userId);
  }

  @Post('viewListAllAvailabilty')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'View all availability' })
  viewListAllAvailabilty(
    @CurrentUser('sub') userId: string,
    @Body() _body: Record<string, unknown>
  ) {
    return this.trainerService.viewListAllAvailabilty(userId);
  }

  @Post('addTrainerAvailability')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add availability slot' })
  addTrainerAvailability(
    @CurrentUser('sub') userId: string,
    @Body() body: { dayOfWeek?: number; startTime?: string; endTime?: string }
  ) {
    return this.trainerService.addTrainerAvailability(
      userId,
      Number(body?.dayOfWeek ?? 0),
      body?.startTime ?? '',
      body?.endTime ?? ''
    );
  }

  @Post('editTrainerAvailability')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Edit availability slot' })
  editTrainerAvailability(
    @CurrentUser('sub') userId: string,
    @Body() body: { id?: string; dayOfWeek?: number; startTime?: string; endTime?: string }
  ) {
    return this.trainerService.editTrainerAvailability(
      userId,
      body?.id ?? '',
      body?.dayOfWeek,
      body?.startTime,
      body?.endTime
    );
  }

  @Post('viewAvailabilty')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'View one or all availability' })
  viewAvailabilty(@CurrentUser('sub') userId: string, @Body() body: { id?: string }) {
    return this.trainerService.viewAvailabilty(userId, body?.id);
  }

  @Post('deleteAvaibilitySlot')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete availability slot' })
  deleteAvaibilitySlot(@CurrentUser('sub') userId: string, @Body() body: { id?: string }) {
    return this.trainerService.deleteAvaibilitySlot(userId, body?.id ?? '');
  }

  @Post('trainerCertificateList')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Trainer certificates list' })
  trainerCertificateList(
    @CurrentUser('sub') userId: string,
    @Body() _body: Record<string, unknown>
  ) {
    return this.trainerService.trainerCertificateList(userId);
  }

  @Post('addTrainerCertificate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add certificate' })
  addTrainerCertificate(
    @CurrentUser('sub') userId: string,
    @Body()
    body: {
      name?: string;
      issuingOrganization?: string | null;
      issuedAt?: string | null;
      credentialId?: string | null;
      documentUrl?: string | null;
    }
  ) {
    return this.trainerService.addTrainerCertificate(
      userId,
      body?.name ?? '',
      body?.issuingOrganization,
      body?.issuedAt,
      body?.credentialId,
      body?.documentUrl
    );
  }

  @Post('editTrainerCertificate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Edit certificate' })
  editTrainerCertificate(
    @CurrentUser('sub') userId: string,
    @Body()
    body: {
      id?: string;
      name?: string;
      issuingOrganization?: string | null;
      issuedAt?: string | null;
      credentialId?: string | null;
      documentUrl?: string | null;
    }
  ) {
    return this.trainerService.editTrainerCertificate(
      userId,
      body?.id ?? '',
      body?.name,
      body?.issuingOrganization,
      body?.issuedAt,
      body?.credentialId,
      body?.documentUrl
    );
  }

  @Post('viewCertification')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'View certification by id' })
  viewCertification(@CurrentUser('sub') userId: string, @Body() body: { id?: string }) {
    return this.trainerService.viewCertification(userId, body?.id ?? '');
  }

  @Post('deleteCertification')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete certification' })
  deleteCertification(@CurrentUser('sub') userId: string, @Body() body: { id?: string }) {
    return this.trainerService.deleteCertification(userId, body?.id ?? '');
  }

  @Post('getAdditionalImageCodes')
  @ApiOperation({ summary: 'Additional image codes (stub)' })
  getAdditionalImageCodes(@Body() _body: Record<string, unknown>) {
    return this.trainerService.getAdditionalImageCodes();
  }

  @Post('addAdditionalImageCodes')
  @ApiOperation({ summary: 'Add additional images (stub)' })
  addAdditionalImageCodes(@Body() _body: Record<string, unknown>) {
    return this.trainerService.addAdditionalImageCodes();
  }

  @Post('removeAdditionalImageCodes')
  @ApiOperation({ summary: 'Remove additional images (stub)' })
  removeAdditionalImageCodes(@Body() _body: Record<string, unknown>) {
    return this.trainerService.removeAdditionalImageCodes();
  }

  @Post('trainerServiceList')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List trainer service areas' })
  trainerServiceList(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.trainerService.trainerServiceList(userId);
  }

  @Post('addTrainerService')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add service area' })
  addTrainerService(
    @CurrentUser('sub') userId: string,
    @Body()
    body: {
      label?: string;
      address?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      radiusKm?: number | null;
    }
  ) {
    return this.trainerService.addTrainerService(
      userId,
      body?.label ?? '',
      body?.address,
      body?.latitude,
      body?.longitude,
      body?.radiusKm
    );
  }

  @Post('viewServiceArea')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'View service area(s); body id = one, omit = list' })
  viewServiceArea(@CurrentUser('sub') userId: string, @Body() body: { id?: string }) {
    return this.trainerService.viewServiceArea(userId, body?.id);
  }

  @Post('editTrainerService')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Edit service area' })
  editTrainerService(
    @CurrentUser('sub') userId: string,
    @Body()
    body: {
      id?: string;
      label?: string;
      address?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      radiusKm?: number | null;
    }
  ) {
    return this.trainerService.editTrainerService(
      userId,
      body?.id ?? '',
      body?.label,
      body?.address,
      body?.latitude,
      body?.longitude,
      body?.radiusKm
    );
  }

  @Post('deleteTrainerService')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete service area' })
  deleteTrainerService(@CurrentUser('sub') userId: string, @Body() body: { id?: string }) {
    return this.trainerService.deleteTrainerService(userId, body?.id ?? '');
  }

  @Post('serviceAreaOnOff')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Toggle or set service area active' })
  serviceAreaOnOff(
    @CurrentUser('sub') userId: string,
    @Body() body: { id?: string; isActive?: boolean }
  ) {
    return this.trainerService.serviceAreaOnOff(userId, body?.id ?? '', body?.isActive);
  }

  @Post('GetTrainerLocation')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current trainer service areas (locations)' })
  GetTrainerLocation(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.trainerService.GetTrainerLocation(userId);
  }

  @Post('addTrainerBankDetails')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add or update bank details' })
  addTrainerBankDetails(
    @CurrentUser('sub') userId: string,
    @Body()
    body: {
      accountHolderName?: string;
      bankName?: string | null;
      last4?: string | null;
      routingLast4?: string | null;
    }
  ) {
    return this.trainerService.addTrainerBankDetails(
      userId,
      body?.accountHolderName ?? '',
      body?.bankName,
      body?.last4,
      body?.routingLast4
    );
  }

  @Post('viewTrainerBankDetails')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'View own bank details' })
  viewTrainerBankDetails(
    @CurrentUser('sub') userId: string,
    @Body() _body: Record<string, unknown>
  ) {
    return this.trainerService.viewTrainerBankDetails(userId);
  }

  @Post('trainerSessionList')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Trainer upcoming sessions' })
  trainerSessionList(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.trainerService.trainerSessionList(userId);
  }

  @Post('trainerSessionNewList')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Trainer new/scheduled sessions' })
  trainerSessionNewList(
    @CurrentUser('sub') userId: string,
    @Body() _body: Record<string, unknown>
  ) {
    return this.trainerService.trainerSessionNewList(userId);
  }

  @Post('trainerSessionCompletedList')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Trainer completed sessions' })
  trainerSessionCompletedList(
    @CurrentUser('sub') userId: string,
    @Body() _body: Record<string, unknown>
  ) {
    return this.trainerService.trainerSessionCompletedList(userId);
  }

  @Post('SessionUpcomingView')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Session detail for upcoming (scheduled) session; body: sessionId' })
  SessionUpcomingView(@CurrentUser('sub') userId: string, @Body() body: { sessionId?: string }) {
    return this.trainerService.SessionUpcomingView(userId, body?.sessionId ?? '');
  }

  @Post('SessionCompletedView')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Session detail for completed session; body: sessionId' })
  SessionCompletedView(@CurrentUser('sub') userId: string, @Body() body: { sessionId?: string }) {
    return this.trainerService.SessionCompletedView(userId, body?.sessionId ?? '');
  }

  @Post('todaySession')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Today session' })
  todaySession(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.trainerService.todaySession(userId);
  }

  @Post('fetchSessionDetails')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fetch session details' })
  fetchSessionDetails(@CurrentUser('sub') userId: string, @Body() body: { sessionId?: string }) {
    return this.trainerService.fetchSessionDetails(userId, body?.sessionId ?? '');
  }

  @Post('cancelSession')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel session (trainer)' })
  cancelSession(@CurrentUser('sub') userId: string, @Body() body: { sessionId?: string }) {
    return this.trainerService.cancelSession(userId, body?.sessionId ?? '');
  }

  @Post('rescheduleSession')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reschedule session (trainer)' })
  rescheduleSession(
    @CurrentUser('sub') userId: string,
    @Body() body: { sessionId?: string; newScheduledAt?: string }
  ) {
    return this.trainerService.rescheduleSession(
      userId,
      body?.sessionId ?? '',
      body?.newScheduledAt ?? ''
    );
  }

  @Post('updateSessionLocation')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Share location for a session (within 30 mins before start)' })
  updateSessionLocation(
    @CurrentUser('sub') userId: string,
    @Body() body: { sessionId?: string; latitude?: number; longitude?: number }
  ) {
    return this.trainerService.updateSessionLocation(
      userId,
      body?.sessionId ?? '',
      Number(body?.latitude ?? 0),
      Number(body?.longitude ?? 0)
    );
  }

  @Post('fetchcancelreason')
  @ApiOperation({ summary: 'Cancel reasons list' })
  fetchcancelreason() {
    return this.trainerService.fetchcancelreason();
  }

  @Post('UpdateSessionCompleteFlag')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark session completed; body: sessionId, optional amountCents' })
  UpdateSessionCompleteFlag(
    @CurrentUser('sub') userId: string,
    @Body() body: { sessionId?: string; amountCents?: number }
  ) {
    return this.trainerService.UpdateSessionCompleteFlag(
      userId,
      body?.sessionId ?? '',
      body?.amountCents
    );
  }

  @Post('currentEarning')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Current earning (from completed sessions)' })
  currentEarning(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.trainerService.currentEarning(userId);
  }

  @Post('earningStats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Earning stats (this month, last month, total)' })
  earningStats(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.trainerService.earningStats(userId);
  }

  @Post('referralSummary')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Referral count and earnings from referred customers' })
  referralSummary(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.trainerService.referralSummary(userId);
  }

  @Post('FetchReviews')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fetch reviews for current trainer' })
  FetchReviews(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.trainerService.FetchReviews(userId);
  }

  @Post('getTrainerAvgRating')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Trainer avg rating; body: trainerId (optional; omit for current user)',
  })
  getTrainerAvgRating(@CurrentUser('sub') userId: string, @Body() body: { trainerId?: string }) {
    const trainerId = body?.trainerId?.trim() || userId;
    return this.trainerService.getTrainerAvgRating(trainerId);
  }

  @Post('getSessionAvgRating')
  @ApiOperation({ summary: 'Session avg rating; body: sessionId' })
  getSessionAvgRating(@Body() body: { sessionId?: string }) {
    return this.trainerService.getSessionAvgRating(body?.sessionId ?? '');
  }

  @Post('faqlist')
  @ApiOperation({ summary: 'FAQ list (stub)' })
  faqlist() {
    return this.trainerService.faqlist();
  }

  @Post('fetchContactLink')
  @ApiOperation({ summary: 'Contact link (stub)' })
  fetchContactLink() {
    return this.trainerService.fetchContactLink();
  }

  @Post('raiseSupport')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create support ticket' })
  raiseSupport(
    @CurrentUser('sub') userId: string,
    @Body() body: { subject?: string; message?: string }
  ) {
    return this.trainerService.raiseSupport(userId, body?.subject ?? '', body?.message ?? '');
  }

  @Post('screenFlags')
  @ApiOperation({ summary: 'Screen flags (stub)' })
  screenFlags(@Body() _body: Record<string, unknown>) {
    return this.trainerService.screenFlags();
  }

  @Post('fileUpload')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'File upload (stub; returns empty profilepath/filecode)' })
  fileUpload(@Body() _body: Record<string, unknown>) {
    return this.trainerService.fileUpload();
  }

  @Post('AddDocument')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add document (stub)' })
  AddDocument(@Body() _body: Record<string, unknown>) {
    return this.trainerService.AddDocument();
  }

  @Post('GetNotificationList')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Notification list' })
  GetNotificationList(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.trainerService.GetNotificationList(userId);
  }

  @Post('GetNotificationFlag')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Notification unread count' })
  GetNotificationFlag(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.trainerService.GetNotificationFlag(userId);
  }

  @Post('UpdateNotificationReadStatus')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark notification(s) as read' })
  UpdateNotificationReadStatus(
    @CurrentUser('sub') userId: string,
    @Body() body: { notificationId?: string }
  ) {
    return this.trainerService.UpdateNotificationReadStatus(userId, body?.notificationId);
  }

  @Post('deleteNotification')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete notification' })
  deleteNotification(
    @CurrentUser('sub') userId: string,
    @Body() body: { notificationId?: string }
  ) {
    return this.trainerService.deleteNotification(userId, body?.notificationId ?? '');
  }

  @Post('DeleteNotifications')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete all notifications' })
  DeleteNotifications(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.trainerService.DeleteNotifications(userId);
  }

  @Post('ReadAllNotification')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  ReadAllNotification(@CurrentUser('sub') userId: string, @Body() _body: Record<string, unknown>) {
    return this.trainerService.ReadAllNotification(userId);
  }

  @Post('deletetrainer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Request trainer account deletion (contact support to complete)' })
  deletetrainer(@Body() _body: Record<string, unknown>) {
    return this.trainerService.deletetrainer();
  }
}
