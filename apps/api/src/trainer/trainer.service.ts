import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { EditProfileDto } from '../common/dto/edit-profile.dto';
import {
  COUNTRIES,
  STATES,
  CITIES,
  LANGUAGES,
  EXPERIENCE_LEVELS,
  CANCEL_REASONS,
} from '../common/reference-data';

/** Session row with customer (for trainer session list map callback typing) */
interface SessionWithCustomer {
  id: string;
  customerId: string;
  trainerId: string;
  activityName: string | null;
  scheduledAt: Date;
  status: string;
  amountCents: number | null;
  customer: { id: string; name: string | null; email: string };
}

function stubSuccess(message = 'OK', data?: Record<string, unknown>) {
  return { mtype: 'success', message, ...data };
}

function stubList<T>(items: T[] = [], message = 'OK') {
  return { mtype: 'success', message, list: items };
}

@Injectable()
export class TrainerService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth() {
    return { division: 'trainer', status: 'ok', timestamp: new Date().toISOString() };
  }

  APIVersionCheck() {
    return {
      mtype: 'success',
      message: 'OK',
      version: '1.0',
      division: 'trainer',
      timestamp: new Date().toISOString(),
    };
  }

  async viewProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return {
      mtype: 'success',
      message: 'OK',
      usercode: user.id,
      name: user.name ?? '',
      emailid: user.email,
      role: user.role,
      locale: user.locale ?? 'en',
      phone: user.phone ?? '',
      countryCode: user.countryCode ?? undefined,
    };
  }

  async editProfile(userId: string, dto: EditProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.locale !== undefined && { locale: dto.locale }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.countryCode !== undefined && { countryCode: dto.countryCode || null }),
      },
    });
    return {
      mtype: 'success',
      message: 'Profile updated',
      usercode: updated.id,
      name: updated.name ?? '',
      emailid: updated.email,
      locale: updated.locale ?? 'en',
      phone: updated.phone ?? '',
      countryCode: updated.countryCode ?? undefined,
    };
  }

  /** Request account deletion (JWT). Returns success; actual deletion can be admin/support flow. */
  deleteProfile() {
    return {
      mtype: 'success',
      message: 'Account deletion requested. Contact support to complete.',
    };
  }

  /** Basic profile (legacy name for viewProfile). JWT = current trainer. */
  async basicdetails(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return {
      mtype: 'success',
      message: 'OK',
      usercode: user.id,
      name: user.name ?? '',
      emailid: user.email,
      role: user.role,
      locale: user.locale ?? 'en',
      phone: user.phone ?? '',
      countryCode: user.countryCode ?? undefined,
    };
  }

  /** Save social links (stub: no DB fields yet; accept body, return success). */
  saveSocialLinks(
    _userId: string,
    _body: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string }
  ) {
    return { mtype: 'success', message: 'OK' };
  }

  /** Get social links (stub: return empty object until DB/storage exists). */
  getSocialLinks() {
    return {
      mtype: 'success',
      message: 'OK',
      getSocialLinks: { facebook: null, instagram: null, twitter: null, linkedin: null },
    };
  }

  /**
   * Legacy: normalize a time string to HH:mm for legacy clients.
   * Body: time or timeStr (e.g. "9:00", "09:00", "9:00 AM"). Returns convertedTime in HH:mm.
   */
  convertRequiredTimeFormat(body: { time?: string; timeStr?: string }) {
    const raw = String(body?.time ?? body?.timeStr ?? '').trim();
    if (!raw) {
      return { mtype: 'success', message: 'OK', convertedTime: '00:00' };
    }
    // Match HH or H and optional :mm and optional AM/PM
    const match = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
    let h = 0;
    let m = 0;
    if (match) {
      h = parseInt(match[1], 10);
      m = match[2] != null ? parseInt(match[2], 10) : 0;
      const pm = (match[3] ?? '').toLowerCase() === 'pm';
      const am = (match[3] ?? '').toLowerCase() === 'am';
      if (pm && h < 12) h += 12;
      if (am && h === 12) h = 0;
      if (!am && !pm && h <= 12 && raw.length <= 5) {
        // Assume 24h if no AM/PM and short string
      } else if (!am && !pm && h < 24) {
        // Already 24h
      }
      h = h % 24;
      m = Math.min(59, Math.max(0, m));
    }
    const convertedTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    return { mtype: 'success', message: 'OK', convertedTime };
  }

  // Reference data
  countryList() {
    return { mtype: 'success', message: 'OK', list: COUNTRIES };
  }

  stateList() {
    return { mtype: 'success', message: 'OK', list: STATES };
  }

  citylist() {
    return { mtype: 'success', message: 'OK', list: CITIES };
  }

  languageList() {
    return { mtype: 'success', message: 'OK', list: LANGUAGES };
  }

  fetchExperienceList() {
    return { mtype: 'success', message: 'OK', list: EXPERIENCE_LEVELS };
  }

  // Activities (master list + trainer's offered activities)
  async allActivityList() {
    const list = await this.prisma.activity.findMany({
      orderBy: { code: 'asc' },
    });
    const out = list.map(
      (a: {
        id: string;
        code: string;
        name: string;
        description: string | null;
        createdAt: Date;
      }) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        description: a.description ?? '',
        createdAt: a.createdAt.toISOString(),
      })
    );
    return { mtype: 'success', message: 'OK', list, allActivityList: out };
  }

  async trainerActivityList(trainerId: string) {
    const rows = await this.prisma.trainerActivity.findMany({
      where: { trainerId },
      orderBy: { createdAt: 'asc' },
    });
    const codes = [...new Set(rows.map((r: { activityCode: string }) => r.activityCode))];
    const activities = codes.length
      ? await this.prisma.activity.findMany({ where: { code: { in: codes } } })
      : [];
    const byCode = Object.fromEntries(activities.map((a: { code: string }) => [a.code, a]));
    const list = rows.map(
      (r: { id: string; trainerId: string; activityCode: string; createdAt: Date }) => {
        const a = byCode[r.activityCode];
        return {
          id: r.id,
          trainerId: r.trainerId,
          activityCode: r.activityCode,
          activityName: a?.name ?? r.activityCode,
          activityDescription: a?.description ?? '',
          createdAt: r.createdAt.toISOString(),
        };
      }
    );
    return { mtype: 'success', message: 'OK', list, trainerActivityList: list };
  }

  async addTrainerActivity(trainerId: string, activityCode: string) {
    const code = String(activityCode ?? '')
      .trim()
      .toLowerCase();
    if (!code) return { mtype: 'error', message: 'Activity code is required' };
    const activity = await this.prisma.activity.findUnique({ where: { code } });
    if (!activity) return { mtype: 'error', message: 'Activity not found' };
    const existing = await this.prisma.trainerActivity.findUnique({
      where: { trainerId_activityCode: { trainerId, activityCode: code } },
    });
    if (existing) return { mtype: 'error', message: 'Already added this activity' };
    const ta = await this.prisma.trainerActivity.create({
      data: { trainerId, activityCode: code },
    });
    return { mtype: 'success', message: 'OK', id: ta.id };
  }

  async editTrainerActivity(trainerId: string, id: string, activityCode?: string) {
    const row = await this.prisma.trainerActivity.findFirst({ where: { id, trainerId } });
    if (!row) return { mtype: 'error', message: 'Trainer activity not found' };
    if (activityCode !== undefined) {
      const code = String(activityCode).trim().toLowerCase();
      if (!code) return { mtype: 'error', message: 'Activity code is required' };
      const activity = await this.prisma.activity.findUnique({ where: { code } });
      if (!activity) return { mtype: 'error', message: 'Activity not found' };
      const existing = await this.prisma.trainerActivity.findUnique({
        where: { trainerId_activityCode: { trainerId, activityCode: code } },
      });
      if (existing && existing.id !== id)
        return { mtype: 'error', message: 'Already added this activity' };
      await this.prisma.trainerActivity.update({
        where: { id },
        data: { activityCode: code },
      });
    }
    return { mtype: 'success', message: 'OK' };
  }

  async viewActivity(trainerId: string, id: string) {
    const row = await this.prisma.trainerActivity.findFirst({ where: { id, trainerId } });
    if (!row) return { mtype: 'error', message: 'Trainer activity not found' };
    const activity = await this.prisma.activity.findUnique({ where: { code: row.activityCode } });
    return {
      mtype: 'success',
      message: 'OK',
      id: row.id,
      trainerId: row.trainerId,
      activityCode: row.activityCode,
      activityName: activity?.name ?? row.activityCode,
      activityDescription: activity?.description ?? '',
      createdAt: row.createdAt.toISOString(),
    };
  }

  async deleteActivity(trainerId: string, id: string) {
    const row = await this.prisma.trainerActivity.findFirst({ where: { id, trainerId } });
    if (!row) return { mtype: 'error', message: 'Trainer activity not found' };
    await this.prisma.trainerActivity.delete({ where: { id } });
    return { mtype: 'success', message: 'OK' };
  }

  // Availability (TrainerAvailability table)
  async trainerAvailabilityList(userId: string) {
    const rows = await this.prisma.trainerAvailability.findMany({
      where: { trainerId: userId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
    const availabilityList = rows.map(
      (r: {
        id: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        createdAt: Date;
      }) => ({
        id: r.id,
        dayOfWeek: r.dayOfWeek,
        startTime: r.startTime,
        endTime: r.endTime,
        createdAt: r.createdAt.toISOString(),
      })
    );
    return { mtype: 'success', message: 'OK', availabilityList };
  }

  async viewListAllAvailabilty(userId: string) {
    return this.trainerAvailabilityList(userId);
  }

  async addTrainerAvailability(
    userId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ) {
    const day = Number(dayOfWeek);
    if (Number.isNaN(day) || day < 0 || day > 6)
      return { mtype: 'error', message: 'dayOfWeek must be 0-6' };
    const start = String(startTime ?? '').trim();
    const end = String(endTime ?? '').trim();
    if (!start || !end) return { mtype: 'error', message: 'startTime and endTime required' };
    const slot = await this.prisma.trainerAvailability.create({
      data: { trainerId: userId, dayOfWeek: day, startTime: start, endTime: end },
    });
    return { mtype: 'success', message: 'OK', id: slot.id };
  }

  async editTrainerAvailability(
    userId: string,
    id: string,
    dayOfWeek?: number,
    startTime?: string,
    endTime?: string
  ) {
    const slot = await this.prisma.trainerAvailability.findFirst({
      where: { id, trainerId: userId },
    });
    if (!slot) return { mtype: 'error', message: 'Slot not found' };
    const data: { dayOfWeek?: number; startTime?: string; endTime?: string } = {};
    if (dayOfWeek !== undefined) {
      const day = Number(dayOfWeek);
      if (Number.isNaN(day) || day < 0 || day > 6)
        return { mtype: 'error', message: 'dayOfWeek must be 0-6' };
      data.dayOfWeek = day;
    }
    if (startTime !== undefined) data.startTime = String(startTime).trim();
    if (endTime !== undefined) data.endTime = String(endTime).trim();
    await this.prisma.trainerAvailability.update({
      where: { id },
      data,
    });
    return { mtype: 'success', message: 'OK' };
  }

  async viewAvailabilty(userId: string, id?: string) {
    if (id) {
      const slot = await this.prisma.trainerAvailability.findFirst({
        where: { id, trainerId: userId },
      });
      if (!slot) return { mtype: 'error', message: 'Slot not found' };
      return {
        mtype: 'success',
        message: 'OK',
        id: slot.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        createdAt: slot.createdAt.toISOString(),
      };
    }
    return this.trainerAvailabilityList(userId);
  }

  async deleteAvaibilitySlot(userId: string, id: string) {
    if (!id?.trim()) return { mtype: 'error', message: 'id required' };
    const slot = await this.prisma.trainerAvailability.findFirst({
      where: { id: id.trim(), trainerId: userId },
    });
    if (!slot) return { mtype: 'error', message: 'Slot not found' };
    await this.prisma.trainerAvailability.delete({ where: { id: id.trim() } });
    return { mtype: 'success', message: 'OK' };
  }

  // Certificates (trainerId = current user)
  async trainerCertificateList(trainerId: string) {
    const list = await this.prisma.trainerCertificate.findMany({
      where: { trainerId },
      orderBy: { createdAt: 'desc' },
    });
    const out = list.map(
      (c: {
        id: string;
        name: string;
        issuingOrganization: string | null;
        issuedAt: Date | null;
        credentialId: string | null;
        documentUrl: string | null;
        createdAt: Date;
      }) => ({
        id: c.id,
        name: c.name,
        issuingOrganization: c.issuingOrganization,
        issuedAt: c.issuedAt?.toISOString() ?? null,
        credentialId: c.credentialId,
        documentUrl: c.documentUrl,
        createdAt: c.createdAt.toISOString(),
      })
    );
    return { mtype: 'success', message: 'OK', list: out, trainerCertificateList: out };
  }

  async addTrainerCertificate(
    trainerId: string,
    name: string,
    issuingOrganization?: string | null,
    issuedAt?: string | null,
    credentialId?: string | null,
    documentUrl?: string | null
  ) {
    const nameNorm = String(name ?? '').trim();
    if (!nameNorm) return { mtype: 'error', message: 'Name is required' };
    const cert = await this.prisma.trainerCertificate.create({
      data: {
        trainerId,
        name: nameNorm,
        issuingOrganization: issuingOrganization?.trim() || null,
        issuedAt: issuedAt ? new Date(issuedAt) : null,
        credentialId: credentialId?.trim() || null,
        documentUrl: documentUrl?.trim() || null,
      },
    });
    return { mtype: 'success', message: 'OK', id: cert.id };
  }

  async editTrainerCertificate(
    trainerId: string,
    id: string,
    name?: string,
    issuingOrganization?: string | null,
    issuedAt?: string | null,
    credentialId?: string | null,
    documentUrl?: string | null
  ) {
    const cert = await this.prisma.trainerCertificate.findFirst({ where: { id, trainerId } });
    if (!cert) return { mtype: 'error', message: 'Certificate not found' };
    const nameNorm = name !== undefined ? String(name).trim() : cert.name;
    if (!nameNorm) return { mtype: 'error', message: 'Name is required' };
    await this.prisma.trainerCertificate.update({
      where: { id },
      data: {
        name: nameNorm,
        ...(issuingOrganization !== undefined && {
          issuingOrganization: issuingOrganization?.trim() || null,
        }),
        ...(issuedAt !== undefined && { issuedAt: issuedAt ? new Date(issuedAt) : null }),
        ...(credentialId !== undefined && { credentialId: credentialId?.trim() || null }),
        ...(documentUrl !== undefined && { documentUrl: documentUrl?.trim() || null }),
      },
    });
    return { mtype: 'success', message: 'OK' };
  }

  async viewCertification(trainerId: string, id: string) {
    const cert = await this.prisma.trainerCertificate.findFirst({
      where: { id, trainerId },
    });
    if (!cert) return { mtype: 'error', message: 'Certificate not found' };
    return {
      mtype: 'success',
      message: 'OK',
      id: cert.id,
      name: cert.name,
      issuingOrganization: cert.issuingOrganization,
      issuedAt: cert.issuedAt?.toISOString() ?? null,
      credentialId: cert.credentialId,
      documentUrl: cert.documentUrl,
      createdAt: cert.createdAt.toISOString(),
      updatedAt: cert.updatedAt.toISOString(),
    };
  }

  async deleteCertification(trainerId: string, id: string) {
    const cert = await this.prisma.trainerCertificate.findFirst({ where: { id, trainerId } });
    if (!cert) return { mtype: 'error', message: 'Certificate not found' };
    await this.prisma.trainerCertificate.delete({ where: { id } });
    return { mtype: 'success', message: 'OK' };
  }

  /** Additional image codes for trainer profile (empty by default; extend when storage exists). */
  getAdditionalImageCodes() {
    const getAdditionalImageCodes: string[] = [];
    return {
      mtype: 'success',
      message: 'OK',
      getAdditionalImageCodes,
      codes: getAdditionalImageCodes,
      list: getAdditionalImageCodes,
    };
  }

  addAdditionalImageCodes() {
    return { mtype: 'success', message: 'OK' };
  }

  removeAdditionalImageCodes() {
    return { mtype: 'success', message: 'OK' };
  }

  // Service area (TrainerServiceArea)
  async trainerServiceList(trainerId: string) {
    const list = await this.prisma.trainerServiceArea.findMany({
      where: { trainerId },
      orderBy: { createdAt: 'asc' },
    });
    const out = list.map(
      (a: {
        id: string;
        label: string;
        address: string | null;
        latitude: number | null;
        longitude: number | null;
        radiusKm: number | null;
        isActive: boolean;
        createdAt: Date;
      }) => ({
        id: a.id,
        label: a.label,
        address: a.address,
        latitude: a.latitude,
        longitude: a.longitude,
        radiusKm: a.radiusKm,
        isActive: a.isActive,
        createdAt: a.createdAt.toISOString(),
      })
    );
    return { mtype: 'success', message: 'OK', list, trainerServiceList: out };
  }

  async addTrainerService(
    trainerId: string,
    label: string,
    address?: string | null,
    latitude?: number | null,
    longitude?: number | null,
    radiusKm?: number | null
  ) {
    const labelNorm = String(label ?? '').trim();
    if (!labelNorm) return { mtype: 'error', message: 'Label is required' };
    const area = await this.prisma.trainerServiceArea.create({
      data: {
        trainerId,
        label: labelNorm,
        address: address?.trim() || null,
        latitude: latitude != null ? Number(latitude) : null,
        longitude: longitude != null ? Number(longitude) : null,
        radiusKm: radiusKm != null ? Number(radiusKm) : null,
      },
    });
    return { mtype: 'success', message: 'OK', id: area.id };
  }

  async viewServiceArea(trainerId: string, id?: string) {
    if (id?.trim()) {
      const area = await this.prisma.trainerServiceArea.findFirst({
        where: { id: id.trim(), trainerId },
      });
      if (!area) return { mtype: 'error', message: 'Service area not found' };
      return {
        mtype: 'success',
        message: 'OK',
        id: area.id,
        label: area.label,
        address: area.address,
        latitude: area.latitude,
        longitude: area.longitude,
        radiusKm: area.radiusKm,
        isActive: area.isActive,
        createdAt: area.createdAt.toISOString(),
        updatedAt: area.updatedAt.toISOString(),
      };
    }
    return this.trainerServiceList(trainerId);
  }

  async editTrainerService(
    trainerId: string,
    id: string,
    label?: string,
    address?: string | null,
    latitude?: number | null,
    longitude?: number | null,
    radiusKm?: number | null
  ) {
    const area = await this.prisma.trainerServiceArea.findFirst({ where: { id, trainerId } });
    if (!area) return { mtype: 'error', message: 'Service area not found' };
    const labelNorm = label !== undefined ? String(label).trim() : area.label;
    if (!labelNorm) return { mtype: 'error', message: 'Label is required' };
    await this.prisma.trainerServiceArea.update({
      where: { id },
      data: {
        label: labelNorm,
        ...(address !== undefined && { address: address?.trim() || null }),
        ...(latitude !== undefined && { latitude: latitude != null ? Number(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude != null ? Number(longitude) : null }),
        ...(radiusKm !== undefined && { radiusKm: radiusKm != null ? Number(radiusKm) : null }),
      },
    });
    return { mtype: 'success', message: 'OK' };
  }

  async deleteTrainerService(trainerId: string, id: string) {
    const area = await this.prisma.trainerServiceArea.findFirst({ where: { id, trainerId } });
    if (!area) return { mtype: 'error', message: 'Service area not found' };
    await this.prisma.trainerServiceArea.delete({ where: { id } });
    return { mtype: 'success', message: 'OK' };
  }

  async serviceAreaOnOff(trainerId: string, id: string, isActive?: boolean) {
    const area = await this.prisma.trainerServiceArea.findFirst({ where: { id, trainerId } });
    if (!area) return { mtype: 'error', message: 'Service area not found' };
    const newActive = isActive !== undefined ? Boolean(isActive) : !area.isActive;
    await this.prisma.trainerServiceArea.update({
      where: { id },
      data: { isActive: newActive },
    });
    return { mtype: 'success', message: 'OK', isActive: newActive };
  }

  /** Returns current trainer's service areas (same shape as trainerServiceList). */
  async GetTrainerLocation(trainerId: string) {
    return this.trainerServiceList(trainerId);
  }

  // Bank details (one per trainer; store only masked/last4)
  async addTrainerBankDetails(
    trainerId: string,
    accountHolderName: string,
    bankName?: string | null,
    last4?: string | null,
    routingLast4?: string | null
  ) {
    const name = String(accountHolderName ?? '').trim();
    if (!name) return { mtype: 'error', message: 'Account holder name is required' };
    const four = String(last4 ?? '')
      .trim()
      .replace(/\D/g, '')
      .slice(-4);
    if (four.length !== 4)
      return { mtype: 'error', message: 'Last 4 digits of account are required' };
    const route4 =
      routingLast4 != null ? String(routingLast4).trim().replace(/\D/g, '').slice(-4) : null;
    const bank = bankName != null ? String(bankName).trim() || null : null;
    await this.prisma.trainerBankDetail.upsert({
      where: { trainerId },
      create: {
        trainerId,
        accountHolderName: name,
        bankName: bank ?? undefined,
        last4: four,
        routingLast4: route4 ?? undefined,
      },
      update: {
        accountHolderName: name,
        bankName: bank ?? undefined,
        last4: four,
        routingLast4: route4 ?? undefined,
      },
    });
    return { mtype: 'success', message: 'OK' };
  }

  async viewTrainerBankDetails(trainerId: string) {
    const row = await this.prisma.trainerBankDetail.findUnique({
      where: { trainerId },
    });
    if (!row) return { mtype: 'error', message: 'Bank details not found' };
    return {
      mtype: 'success',
      message: 'OK',
      id: row.id,
      accountHolderName: row.accountHolderName,
      bankName: row.bankName,
      last4: row.last4,
      routingLast4: row.routingLast4,
      createdAt: row.createdAt.toISOString(),
    };
  }

  // Sessions (real data from Session table where trainerId = userId)
  async trainerSessionList(userId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { trainerId: userId, status: 'scheduled' },
      include: { customer: { select: { id: true, name: true, email: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
    const trainerSessionList = sessions.map((s: SessionWithCustomer) => ({
      id: s.id,
      sessionId: s.id,
      sessionName: s.activityName ?? 'Session',
      customerId: s.customerId,
      customerName: s.customer.name ?? s.customer.email,
      scheduledAt: s.scheduledAt.toISOString(),
      status: s.status,
      amountCents: s.amountCents,
    }));
    return { mtype: 'success', message: 'OK', trainerSessionList };
  }

  async trainerSessionNewList(userId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { trainerId: userId, status: 'scheduled' },
      include: { customer: { select: { id: true, name: true, email: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
    const trainerSessionNewList = sessions.map((s: SessionWithCustomer) => ({
      id: s.id,
      sessionId: s.id,
      sessionName: s.activityName ?? 'Session',
      customerId: s.customerId,
      customerName: s.customer.name ?? s.customer.email,
      scheduledAt: s.scheduledAt.toISOString(),
      status: s.status,
      amountCents: s.amountCents,
    }));
    return { mtype: 'success', message: 'OK', trainerSessionNewList };
  }

  async trainerSessionCompletedList(userId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { trainerId: userId, status: 'completed' },
      include: { customer: { select: { id: true, name: true, email: true } } },
      orderBy: { scheduledAt: 'desc' },
    });
    const trainerSessionCompletedList = sessions.map((s: SessionWithCustomer) => ({
      id: s.id,
      sessionId: s.id,
      sessionName: s.activityName ?? 'Session',
      customerId: s.customerId,
      customerName: s.customer.name ?? s.customer.email,
      scheduledAt: s.scheduledAt.toISOString(),
      status: s.status,
      amountCents: s.amountCents,
    }));
    return { mtype: 'success', message: 'OK', trainerSessionCompletedList };
  }

  /** Session detail for an upcoming (scheduled) session; body: sessionId. */
  async SessionUpcomingView(userId: string, sessionId: string) {
    const result = await this.fetchSessionDetails(userId, sessionId);
    if (result.mtype !== 'success' || (result as { status?: string }).status !== 'scheduled')
      return { mtype: 'error', message: 'Session not found or not upcoming' };
    return result;
  }

  /** Session detail for a completed session; body: sessionId. */
  async SessionCompletedView(userId: string, sessionId: string) {
    const result = await this.fetchSessionDetails(userId, sessionId);
    if (result.mtype !== 'success' || (result as { status?: string }).status !== 'completed')
      return { mtype: 'error', message: 'Session not found or not completed' };
    return result;
  }

  async todaySession(userId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const sessions = await this.prisma.session.findMany({
      where: { trainerId: userId, status: 'scheduled', scheduledAt: { gte: start, lt: end } },
      include: { customer: { select: { id: true, name: true, email: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
    const todaySession = sessions.map((s: SessionWithCustomer) => ({
      id: s.id,
      sessionId: s.id,
      sessionName: s.activityName ?? 'Session',
      customerName: s.customer.name ?? s.customer.email,
      scheduledAt: s.scheduledAt.toISOString(),
    }));
    return { mtype: 'success', message: 'OK', todaySession };
  }

  async fetchSessionDetails(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, trainerId: userId },
      include: { customer: { select: { id: true, name: true, email: true, phone: true } } },
    });
    if (!session) return { mtype: 'error', message: 'Session not found' };
    return {
      mtype: 'success',
      message: 'OK',
      id: session.id,
      sessionId: session.id,
      sessionName: session.activityName ?? 'Session',
      customerId: session.customerId,
      customerName: session.customer.name ?? session.customer.email,
      customerEmail: session.customer.email,
      customerPhone: session.customer.phone,
      scheduledAt: session.scheduledAt.toISOString(),
      status: session.status,
      amountCents: session.amountCents,
      createdAt: session.createdAt.toISOString(),
    };
  }

  async cancelSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, trainerId: userId },
    });
    if (!session) return { mtype: 'error', message: 'Session not found' };
    if (session.status !== 'scheduled')
      return { mtype: 'error', message: 'Session cannot be cancelled' };
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'cancelled' },
    });
    return { mtype: 'success', message: 'Session cancelled' };
  }

  async rescheduleSession(userId: string, sessionId: string, newScheduledAt: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, trainerId: userId },
    });
    if (!session) return { mtype: 'error', message: 'Session not found' };
    if (session.status !== 'scheduled')
      return { mtype: 'error', message: 'Session cannot be rescheduled' };
    const date = new Date(newScheduledAt);
    if (Number.isNaN(date.getTime())) return { mtype: 'error', message: 'Invalid date/time' };
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { scheduledAt: date },
    });
    return { mtype: 'success', message: 'Session rescheduled' };
  }

  fetchcancelreason() {
    return { mtype: 'success', message: 'OK', list: CANCEL_REASONS };
  }

  /** Mark a scheduled session as completed; body: sessionId, optional amountCents. */
  async UpdateSessionCompleteFlag(userId: string, sessionId: string, amountCents?: number) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, trainerId: userId, status: 'scheduled' },
    });
    if (!session) return { mtype: 'error', message: 'Session not found or not scheduled' };
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        ...(amountCents != null && { amountCents }),
      },
    });
    return { mtype: 'success', message: 'Session marked completed' };
  }

  // Earning (from Session completed, trainerId = userId)
  async currentEarning(userId: string) {
    const result = await this.prisma.session.aggregate({
      where: { trainerId: userId, status: 'completed' },
      _sum: { amountCents: true },
      _count: true,
    });
    const totalCents = result._sum.amountCents ?? 0;
    return {
      mtype: 'success',
      message: 'OK',
      currentEarning: totalCents,
      totalCents,
      totalFormatted: `$${(totalCents / 100).toFixed(2)}`,
      completedSessionCount: result._count,
    };
  }

  async earningStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const [thisMonth, lastMonth, all] = await Promise.all([
      this.prisma.session.aggregate({
        where: { trainerId: userId, status: 'completed', scheduledAt: { gte: startOfMonth } },
        _sum: { amountCents: true },
        _count: true,
      }),
      this.prisma.session.aggregate({
        where: {
          trainerId: userId,
          status: 'completed',
          scheduledAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { amountCents: true },
        _count: true,
      }),
      this.prisma.session.aggregate({
        where: { trainerId: userId, status: 'completed' },
        _sum: { amountCents: true },
        _count: true,
      }),
    ]);
    const earningStats = {
      thisMonthCents: thisMonth._sum.amountCents ?? 0,
      thisMonthCount: thisMonth._count,
      lastMonthCents: lastMonth._sum.amountCents ?? 0,
      lastMonthCount: lastMonth._count,
      totalCents: all._sum.amountCents ?? 0,
      totalSessionCount: all._count,
    };
    return { mtype: 'success', message: 'OK', earningStats };
  }

  /** Referrals made by this trainer and earnings from sessions with referred customers. */
  async referralSummary(userId: string) {
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: userId },
      select: { referredUserId: true },
    });
    const referredIds = referrals.map((r: { referredUserId: string }) => r.referredUserId);
    const totalReferrals = referredIds.length;
    const earningResult =
      referredIds.length > 0
        ? await this.prisma.session.aggregate({
            where: {
              trainerId: userId,
              status: 'completed',
              customerId: { in: referredIds },
            },
            _sum: { amountCents: true },
          })
        : { _sum: { amountCents: null as number | null } };
    const totalEarnedFromReferrals = earningResult._sum.amountCents ?? 0;
    return {
      mtype: 'success',
      message: 'OK',
      referralSummary: { totalReferrals, totalEarnedFromReferrals },
    };
  }

  // Reviews (for a trainer: list + avg rating)
  async FetchReviews(trainerId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { trainerId },
      include: { customer: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const list = reviews.map(
      (r: {
        id: string;
        trainerId: string;
        customerId: string;
        sessionId: string | null;
        rating: number;
        comment: string | null;
        createdAt: Date;
        customer: { name: string | null; email: string };
      }) => ({
        id: r.id,
        trainerId: r.trainerId,
        customerId: r.customerId,
        customerName: r.customer.name ?? r.customer.email,
        sessionId: r.sessionId,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
      })
    );
    return { mtype: 'success', message: 'OK', list, FetchReviews: list };
  }

  async getTrainerAvgRating(trainerId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { trainerId },
      _avg: { rating: true },
      _count: true,
    });
    const rating = agg._count > 0 ? Math.round((agg._avg.rating ?? 0) * 10) / 10 : 0;
    return { mtype: 'success', message: 'OK', rating, reviewCount: agg._count };
  }

  async getSessionAvgRating(sessionId: string) {
    if (!sessionId?.trim()) return { mtype: 'success', message: 'OK', rating: 0, reviewCount: 0 };
    const agg = await this.prisma.review.aggregate({
      where: { sessionId: sessionId.trim() },
      _avg: { rating: true },
      _count: true,
    });
    const rating = agg._count > 0 ? Math.round((agg._avg.rating ?? 0) * 10) / 10 : 0;
    return { mtype: 'success', message: 'OK', rating, reviewCount: agg._count };
  }

  // FAQ / Help (same as customer: from Faq table and ContactSetting)
  async faqlist() {
    const rows = await this.prisma.faq.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, question: true, answer: true },
    });
    const faqlist = rows.map((r: { id: string; question: string; answer: string }) => ({
      id: r.id,
      question: r.question,
      answer: r.answer,
    }));
    return { mtype: 'success', message: 'OK', faqlist, list: faqlist };
  }

  async fetchContactLink() {
    const row = await this.prisma.contactSetting.findUnique({
      where: { key: 'contact_email' },
    });
    const contactEmail = row?.value ?? process.env.CONTACT_EMAIL ?? 'support@groupfit.example.com';
    return { mtype: 'success', message: 'OK', contactLink: '', contactEmail };
  }

  async raiseSupport(userId: string, subject: string, message: string) {
    if (!subject?.trim() || !message?.trim())
      return { mtype: 'error', message: 'Subject and message required' };
    const ticket = await this.prisma.supportTicket.create({
      data: { userId, subject: subject.trim(), message: message.trim(), status: 'open' },
    });
    return { mtype: 'success', message: 'OK', ticketId: ticket.id };
  }

  /** Feature / UI flags for trainer app (extend when needed). */
  screenFlags() {
    return { mtype: 'success', message: 'OK', screenFlags: {} };
  }

  // File (stub until storage/upload implemented)
  fileUpload() {
    return { mtype: 'success', message: 'OK', profilepath: '', filecode: '' };
  }

  AddDocument() {
    return { mtype: 'success', message: 'OK' };
  }

  // Notifications (same Notification table as customer; userId = trainer id)
  async GetNotificationList(userId: string) {
    const rows = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, body: true, read: true, createdAt: true },
    });
    const notificationList = rows.map(
      (r: { id: string; title: string; body: string | null; read: boolean; createdAt: Date }) => ({
        id: r.id,
        title: r.title,
        body: r.body ?? '',
        read: r.read,
        createdAt: r.createdAt.toISOString(),
      })
    );
    return { mtype: 'success', message: 'OK', notificationList };
  }

  async GetNotificationFlag(userId: string) {
    const unreadCount = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    return { mtype: 'success', message: 'OK', unreadCount };
  }

  async UpdateNotificationReadStatus(userId: string, notificationId?: string) {
    if (notificationId) {
      await this.prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { read: true },
      });
    } else {
      await this.prisma.notification.updateMany({
        where: { userId },
        data: { read: true },
      });
    }
    return { mtype: 'success', message: 'OK' };
  }

  async deleteNotification(userId: string, notificationId: string) {
    if (!notificationId?.trim()) return { mtype: 'error', message: 'notificationId required' };
    await this.prisma.notification.deleteMany({
      where: { id: notificationId.trim(), userId },
    });
    return { mtype: 'success', message: 'OK' };
  }

  async DeleteNotifications(userId: string) {
    await this.prisma.notification.deleteMany({ where: { userId } });
    return { mtype: 'success', message: 'OK' };
  }

  async ReadAllNotification(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId },
      data: { read: true },
    });
    return { mtype: 'success', message: 'OK' };
  }

  /** Request trainer account deletion (same as deleteProfile for legacy route). */
  deletetrainer() {
    return {
      mtype: 'success',
      message: 'Account deletion requested. Contact support to complete.',
    };
  }
}
