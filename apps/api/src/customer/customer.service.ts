import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import type { EditProfileDto } from '../common/dto/edit-profile.dto';
import {
  COUNTRIES,
  STATES,
  CITIES,
  ACTIVITY_TYPES,
  CANCEL_REASONS,
  COUNTRY_TO_CURRENCY,
} from '../common/reference-data';

/** Session row with trainer (for customer session list map callback typing) */
interface SessionWithTrainer {
  id: string;
  customerId: string;
  trainerId: string;
  activityName: string | null;
  scheduledAt: Date;
  status: string;
  amountCents: number | null;
  trainer: { id: string; name: string | null; email: string };
}
/** User row for topratedTrainersList map callback typing */
interface UserSelect {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
}

/** Default radius in km when service area has no radiusKm set. */
const DEFAULT_LOCATION_RADIUS_KM = 25;

/** Approximate distance in km between two points (Haversine). */
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Returns trainer IDs that have at least one active service area containing (lat, lon). */
async function getTrainerIdsAtLocation(
  prisma: PrismaService,
  latitude: number,
  longitude: number,
  radiusKm: number
): Promise<string[]> {
  const areas = await prisma.trainerServiceArea.findMany({
    where: { isActive: true, latitude: { not: null }, longitude: { not: null } },
    select: { trainerId: true, latitude: true, longitude: true, radiusKm: true },
  });
  const ids = new Set<string>();
  for (const a of areas) {
    const lat = a.latitude as number;
    const lon = a.longitude as number;
    const r = a.radiusKm != null ? a.radiusKm : DEFAULT_LOCATION_RADIUS_KM;
    if (distanceKm(latitude, longitude, lat, lon) <= r) ids.add(a.trainerId);
  }
  return [...ids];
}

/** Stripe module name (variable avoids TS resolving it in test env where types may be missing) */
const STRIPE_MODULE = 'stripe';

/** Stub response shape matching legacy C# API (mtype, message, etc.) */
export function stubSuccess(message = 'OK', data?: Record<string, unknown>) {
  return { mtype: 'success', message, ...data };
}

export function stubList<T>(items: T[] = [], message = 'OK') {
  return { mtype: 'success', message, list: items };
}

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService
  ) {}

  getHealth() {
    return { division: 'customer', status: 'ok', timestamp: new Date().toISOString() };
  }

  APIVersionCheck() {
    return {
      mtype: 'success',
      message: 'OK',
      version: '1.0',
      division: 'customer',
      timestamp: new Date().toISOString(),
    };
  }

  /** Get profile for the current user (JWT sub). Returns legacy-shaped object + customer profile fields. */
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
      avatarUrl: user.avatarUrl ?? undefined,
      gender: user.gender ?? undefined,
      dateOfBirth: user.dateOfBirth?.toISOString().slice(0, 10) ?? undefined,
      heightCm: user.heightCm ?? undefined,
      weightKg: user.weightKg ?? undefined,
      preExistingConditions: user.preExistingConditions ?? undefined,
    };
  }

  /** Update profile for the current user. */
  async editProfile(userId: string, dto: EditProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const data: Parameters<typeof this.prisma.user.update>[0]['data'] = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.locale !== undefined && { locale: dto.locale }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.countryCode !== undefined && { countryCode: dto.countryCode || null }),
      ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl || null }),
      ...(dto.gender !== undefined && { gender: dto.gender || null }),
      ...(dto.dateOfBirth !== undefined && {
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      }),
      ...(dto.heightCm !== undefined && { heightCm: dto.heightCm ?? null }),
      ...(dto.weightKg !== undefined && { weightKg: dto.weightKg ?? null }),
      ...(dto.preExistingConditions !== undefined && {
        preExistingConditions: dto.preExistingConditions || null,
      }),
    };
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
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
      avatarUrl: updated.avatarUrl ?? undefined,
      gender: updated.gender ?? undefined,
      dateOfBirth: updated.dateOfBirth?.toISOString().slice(0, 10) ?? undefined,
      heightCm: updated.heightCm ?? undefined,
      weightKg: updated.weightKg ?? undefined,
      preExistingConditions: updated.preExistingConditions ?? undefined,
    };
  }

  /** Request account deletion (JWT). Returns success; actual deletion can be admin/support flow. */
  deleteProfile() {
    return {
      mtype: 'success',
      message: 'Account deletion requested. Contact support to complete.',
    };
  }

  /** Toast key for activities disclaimer modal. */
  private static readonly TOAST_ACTIVITIES_DISCLAIMER = 'activities_disclaimer_seen';

  async getToastActivitiesDisclaimer(userId: string) {
    const row = await this.prisma.toast.findUnique({
      where: {
        userId_key: { userId, key: CustomerService.TOAST_ACTIVITIES_DISCLAIMER },
      },
    });
    return {
      mtype: 'success',
      message: 'OK',
      seen: !!row,
    };
  }

  async setToastActivitiesDisclaimer(userId: string) {
    await this.prisma.toast.upsert({
      where: {
        userId_key: { userId, key: CustomerService.TOAST_ACTIVITIES_DISCLAIMER },
      },
      create: { userId, key: CustomerService.TOAST_ACTIVITIES_DISCLAIMER },
      update: { updatedAt: new Date() },
    });
    return { mtype: 'success', message: 'OK' };
  }

  // Reference data (legacy customerApi)
  countryList() {
    return { mtype: 'success', message: 'OK', list: COUNTRIES, countryList: COUNTRIES };
  }

  stateList() {
    return { mtype: 'success', message: 'OK', list: STATES, stateList: STATES };
  }

  citylist() {
    return { mtype: 'success', message: 'OK', list: CITIES, citylist: CITIES };
  }

  // Groups: owned by user or where user is a member. Includes myMemberId when user is a member (for "Leave group").
  async fetchallgroupslist(userId: string) {
    const owned = await this.prisma.group.findMany({
      where: { ownerId: userId },
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const memberOf = await this.prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: { include: { _count: { select: { members: true } } } },
      },
    });
    const memberGroupIds = new Set(memberOf.map((m: { groupId: string }) => m.groupId));
    const ownedIds = new Set(owned.map((g: { id: string }) => g.id));
    const extraGroups = memberOf
      .filter((m: { groupId: string }) => !ownedIds.has(m.groupId))
      .map(
        (m: {
          id: string;
          groupId: string;
          group: {
            id: string;
            name: string;
            ownerId: string;
            createdAt: Date;
            _count: { members: number };
          };
        }) => ({
          id: m.group.id,
          name: m.group.name,
          ownerId: m.group.ownerId,
          memberCount: m.group._count.members,
          createdAt: m.group.createdAt.toISOString(),
          myMemberId: m.id,
        })
      );
    const list = [
      ...owned.map(
        (g: {
          id: string;
          name: string;
          ownerId: string;
          createdAt: Date;
          _count: { members: number };
        }) => {
          const myMembership = memberOf.find((m: { groupId: string }) => m.groupId === g.id);
          return {
            id: g.id,
            name: g.name,
            ownerId: g.ownerId,
            memberCount: g._count.members,
            createdAt: g.createdAt.toISOString(),
            ...(myMembership && { myMemberId: (myMembership as { id: string }).id }),
          };
        }
      ),
      ...extraGroups,
    ].sort(
      (a, b) =>
        new Date((b as { createdAt: string }).createdAt).getTime() -
        new Date((a as { createdAt: string }).createdAt).getTime()
    );
    return { mtype: 'success', message: 'OK', fetchallgroupslist: list };
  }

  async addgroupname(userId: string, name: string) {
    const nameNorm = String(name ?? '').trim();
    if (!nameNorm) return { mtype: 'error', message: 'Group name is required' };
    const group = await this.prisma.group.create({
      data: { ownerId: userId, name: nameNorm },
    });
    return { mtype: 'success', message: 'OK', id: group.id };
  }

  async editgroup(userId: string, groupId: string, name: string) {
    const nameNorm = String(name ?? '').trim();
    if (!nameNorm) return { mtype: 'error', message: 'Group name is required' };
    const group = await this.prisma.group.findFirst({ where: { id: groupId, ownerId: userId } });
    if (!group) return { mtype: 'error', message: 'Group not found' };
    await this.prisma.group.update({
      where: { id: groupId },
      data: { name: nameNorm },
    });
    return { mtype: 'success', message: 'OK' };
  }

  async addgroupmember(userId: string, groupId: string, memberUserId: string) {
    const group = await this.prisma.group.findFirst({ where: { id: groupId, ownerId: userId } });
    if (!group) return { mtype: 'error', message: 'Group not found' };
    const uid = String(memberUserId ?? '').trim();
    if (!uid) return { mtype: 'error', message: 'Member user id is required' };
    const member = await this.prisma.user.findUnique({ where: { id: uid } });
    if (!member) return { mtype: 'error', message: 'User not found' };
    try {
      const gm = await this.prisma.groupMember.create({
        data: { groupId, userId: uid },
      });
      return { mtype: 'success', message: 'OK', id: gm.id };
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002')
        return { mtype: 'error', message: 'Already in group' };
      throw e;
    }
  }

  async fetchgroupMembers(userId: string, groupId: string) {
    const group = await this.prisma.group.findFirst({
      where: { id: groupId, ownerId: userId },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });
    if (!group) return { mtype: 'error', message: 'Group not found' };
    const list = group.members.map(
      (m: {
        id: string;
        userId: string;
        createdAt: Date;
        user: { id: string; name: string | null; email: string };
      }) => ({
        id: m.id,
        userId: m.userId,
        userName: m.user.name,
        userEmail: m.user.email,
        createdAt: m.createdAt.toISOString(),
      })
    );
    return { mtype: 'success', message: 'OK', list, fetchgroupMembers: list };
  }

  async updategroupmember(userId: string, groupId: string, memberId: string) {
    const group = await this.prisma.group.findFirst({ where: { id: groupId } });
    if (!group) return { mtype: 'error', message: 'Group not found' };
    const member = await this.prisma.groupMember.findFirst({
      where: { id: memberId, groupId },
    });
    if (!member) return { mtype: 'error', message: 'Member not found' };
    const isOwner = group.ownerId === userId;
    const isSelf = member.userId === userId;
    if (!isOwner && !isSelf)
      return { mtype: 'error', message: 'Only the group owner can remove other members' };
    await this.prisma.groupMember.delete({ where: { id: memberId } });
    return { mtype: 'success', message: 'OK' };
  }

  async deletegrouplist(userId: string, groupId: string) {
    const group = await this.prisma.group.findFirst({ where: { id: groupId, ownerId: userId } });
    if (!group) return { mtype: 'error', message: 'Group not found' };
    await this.prisma.group.delete({ where: { id: groupId } });
    return { mtype: 'success', message: 'OK' };
  }

  /** Returns customers not in the given group (for "add member" picker). Owner only. */
  async fetchSoloMembers(userId: string, groupId?: string) {
    if (!groupId?.trim())
      return { mtype: 'success', message: 'OK', list: [], fetchSoloMembers: [] };
    const group = await this.prisma.group.findFirst({
      where: { id: groupId.trim(), ownerId: userId },
      include: { members: { select: { userId: true } } },
    });
    if (!group) return { mtype: 'error', message: 'Group not found' };
    const memberIds = new Set(group.members.map((m: { userId: string }) => m.userId));
    const users = await this.prisma.user.findMany({
      where: { role: 'customer', id: { notIn: [...memberIds] } },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
    const list = users.map((u: { id: string; name: string | null; email: string }) => ({
      id: u.id,
      name: u.name ?? u.email,
      email: u.email,
    }));
    return { mtype: 'success', message: 'OK', list, fetchSoloMembers: list };
  }

  /** Normalize phone for lookup (E.164-style: digits only, optional leading +). */
  private static normalizePhone(phone: string): string {
    const trimmed = String(phone ?? '').trim();
    const hasPlus = trimmed.startsWith('+');
    const digits = trimmed.replace(/\D/g, '');
    return digits ? (hasPlus ? `+${digits}` : digits) : '';
  }

  /**
   * Invite a member to the group by phone number.
   * - If user exists (customer): add to group, create in-app notification, send SMS that they were added.
   * - If user does not exist: store pending invite, send SMS to sign up for GroupFit to join the group.
   */
  async inviteGroupMemberByPhone(userId: string, groupId: string, phone: string) {
    const normalized = CustomerService.normalizePhone(phone);
    if (!normalized) return { mtype: 'error', message: 'Please enter a valid phone number' };

    const group = await this.prisma.group.findFirst({
      where: { id: groupId, ownerId: userId },
      include: { owner: { select: { name: true, email: true } } },
    });
    if (!group) return { mtype: 'error', message: 'Group not found' };

    const inviterName = group.owner.name ?? group.owner.email ?? 'A member';
    const groupName = group.name;

    const existingUser = await this.prisma.user.findUnique({
      where: { phone: normalized },
      select: { id: true, role: true },
    });

    if (existingUser) {
      if (existingUser.role !== 'customer')
        return {
          mtype: 'error',
          message:
            'That phone number belongs to a trainer or admin. Only customers can be added to groups.',
        };

      const alreadyMember = await this.prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId: existingUser.id } },
      });
      if (alreadyMember) return { mtype: 'error', message: 'That person is already in the group' };

      await this.prisma.groupMember.create({
        data: { groupId, userId: existingUser.id },
      });

      await this.prisma.notification.create({
        data: {
          userId: existingUser.id,
          title: 'Added to group',
          body: `${inviterName} added you to the group "${groupName}".`,
          read: false,
        },
      });

      await this.authService.sendSms(
        normalized,
        `${inviterName} added you to the group "${groupName}" on GroupFit.`
      );

      return {
        mtype: 'success',
        message: "They've been added to the group and notified by SMS.",
        added: true,
      };
    }

    await this.prisma.groupInviteByPhone.upsert({
      where: { groupId_phone: { groupId, phone: normalized } },
      create: { groupId, phone: normalized, invitedById: userId, status: 'PENDING' },
      update: { invitedById: userId, status: 'PENDING' },
    });

    await this.authService.sendSms(
      normalized,
      `${inviterName} invited you to the group "${groupName}". Create an account on GroupFit to join: sign up with this phone number and you can join the group.`
    );

    return {
      mtype: 'success',
      message:
        'Invitation sent by SMS. They can join the group once they create a GroupFit account with this phone number.',
      added: false,
    };
  }

  /**
   * List phone invites for a group (owner only). Returns invites with status PENDING | APPROVED | REJECTED.
   */
  async listGroupInvitesByPhone(userId: string, groupId: string) {
    const group = await this.prisma.group.findFirst({
      where: { id: groupId, ownerId: userId },
      include: {
        invitesByPhone: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!group) return { mtype: 'error', message: 'Group not found' };
    const list = group.invitesByPhone.map(
      (inv: { id: string; phone: string; status: string; createdAt: Date; updatedAt: Date }) => ({
        id: inv.id,
        phone: inv.phone,
        status: inv.status,
        createdAt: inv.createdAt.toISOString(),
        updatedAt: inv.updatedAt.toISOString(),
      })
    );
    return { mtype: 'success', message: 'OK', list, listGroupInvitesByPhone: list };
  }

  /**
   * List pending group invites for the current user (invitee). Returns invites where current user's phone matches and status is PENDING.
   */
  async listMyPendingGroupInvites(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true },
    });
    if (!user?.phone) return { mtype: 'success', list: [], listMyPendingGroupInvites: [] };
    const normalized = CustomerService.normalizePhone(user.phone);
    if (!normalized) return { mtype: 'success', list: [], listMyPendingGroupInvites: [] };
    const invites = await this.prisma.groupInviteByPhone.findMany({
      where: { phone: normalized, status: 'PENDING' },
      include: { group: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const list = invites.map(
      (inv: {
        id: string;
        groupId: string;
        createdAt: Date;
        group: { id: string; name: string };
      }) => ({
        id: inv.id,
        groupId: inv.groupId,
        groupName: inv.group.name,
        createdAt: inv.createdAt.toISOString(),
      })
    );
    return { mtype: 'success', list, listMyPendingGroupInvites: list };
  }

  /**
   * Accept a group invite (invitee). Current user's phone must match the invite; adds user to group and sets status APPROVED.
   */
  async acceptGroupInviteByPhone(userId: string, inviteId: string) {
    const invite = await this.prisma.groupInviteByPhone.findUnique({
      where: { id: inviteId },
      include: { group: { select: { id: true, name: true, ownerId: true } } },
    });
    if (!invite || invite.status !== 'PENDING')
      return { mtype: 'error', message: 'Invite not found or no longer pending' };
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true, role: true },
    });
    if (!user?.phone || user.role !== 'customer')
      return { mtype: 'error', message: 'Only customers with a phone can accept group invites' };
    const normalized = CustomerService.normalizePhone(user.phone);
    if (!normalized || normalized !== invite.phone)
      return { mtype: 'error', message: 'This invite was sent to a different phone number' };
    const existing = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: invite.groupId, userId } },
    });
    if (existing) {
      await this.prisma.groupInviteByPhone.update({
        where: { id: inviteId },
        data: { status: 'APPROVED' },
      });
      return { mtype: 'success', message: 'You are already in this group', approved: true };
    }
    await this.prisma.$transaction([
      this.prisma.groupMember.create({ data: { groupId: invite.groupId, userId } }),
      this.prisma.groupInviteByPhone.update({
        where: { id: inviteId },
        data: { status: 'APPROVED' },
      }),
    ]);
    return {
      mtype: 'success',
      message: `You've joined the group "${invite.group.name}"`,
      approved: true,
    };
  }

  /**
   * Reject a group invite (invitee). Current user's phone must match the invite; sets status REJECTED.
   */
  async rejectGroupInviteByPhone(userId: string, inviteId: string) {
    const invite = await this.prisma.groupInviteByPhone.findUnique({
      where: { id: inviteId },
    });
    if (!invite || invite.status !== 'PENDING')
      return { mtype: 'error', message: 'Invite not found or no longer pending' };
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true },
    });
    if (!user?.phone)
      return { mtype: 'error', message: 'Only users with a phone can reject group invites' };
    const normalized = CustomerService.normalizePhone(user.phone);
    if (!normalized || normalized !== invite.phone)
      return { mtype: 'error', message: 'This invite was sent to a different phone number' };
    await this.prisma.groupInviteByPhone.update({
      where: { id: inviteId },
      data: { status: 'REJECTED' },
    });
    return { mtype: 'success', message: 'Invite declined', rejected: true };
  }

  // Referral (people the current user has referred)
  async ReferralList(userId: string) {
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referredUser: { select: { id: true, email: true, name: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const list = referrals.map(
      (r: {
        id: string;
        referredUserId: string;
        createdAt: Date;
        referredUser: { name: string | null; email: string; createdAt: Date };
      }) => ({
        id: r.id,
        referredUserId: r.referredUserId,
        referredUserName: r.referredUser.name,
        referredUserEmail: r.referredUser.email,
        referredUserJoinedAt: r.referredUser.createdAt.toISOString(),
        createdAt: r.createdAt.toISOString(),
      })
    );
    return { mtype: 'success', message: 'OK', ReferralList: list, list };
  }

  async referraldetails(userId: string, referralId: string) {
    if (!referralId) return { mtype: 'error', message: 'referralId is required' };
    const referral = await this.prisma.referral.findFirst({
      where: { id: referralId, referrerId: userId },
      include: {
        referredUser: {
          select: { id: true, email: true, name: true, phone: true, createdAt: true },
        },
      },
    });
    if (!referral) return { mtype: 'error', message: 'Referral not found' };
    return {
      mtype: 'success',
      message: 'OK',
      id: referral.id,
      referredUserId: referral.referredUserId,
      referredUserName: referral.referredUser.name,
      referredUserEmail: referral.referredUser.email,
      referredUserPhone: referral.referredUser.phone,
      referredUserJoinedAt: referral.referredUser.createdAt.toISOString(),
      createdAt: referral.createdAt.toISOString(),
    };
  }

  // Sessions (real data from Session table when customerId = userId)
  async customerSessionList(userId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { customerId: userId, status: { in: ['scheduled'] } },
      include: { trainer: { select: { id: true, name: true, email: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
    const customerSessionList = sessions.map((s: SessionWithTrainer) => ({
      id: s.id,
      sessionId: s.id,
      sessionName: s.activityName ?? 'Session',
      trainerId: s.trainerId,
      trainerName: s.trainer.name ?? s.trainer.email,
      scheduledAt: s.scheduledAt.toISOString(),
      status: s.status,
      amountCents: s.amountCents,
    }));
    return { mtype: 'success', message: 'OK', customerSessionList };
  }

  async customerSessionCompletedList(userId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { customerId: userId, status: 'completed' },
      include: { trainer: { select: { id: true, name: true, email: true } } },
      orderBy: { scheduledAt: 'desc' },
    });
    const customerSessionCompletedList = sessions.map((s: SessionWithTrainer) => ({
      id: s.id,
      sessionId: s.id,
      sessionName: s.activityName ?? 'Session',
      trainerId: s.trainerId,
      trainerName: s.trainer.name ?? s.trainer.email,
      scheduledAt: s.scheduledAt.toISOString(),
      status: s.status,
      amountCents: s.amountCents,
    }));
    return { mtype: 'success', message: 'OK', customerSessionCompletedList };
  }

  async todaysessionlist(userId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const sessions = await this.prisma.session.findMany({
      where: {
        customerId: userId,
        status: 'scheduled',
        scheduledAt: { gte: start, lt: end },
      },
      include: { trainer: { select: { id: true, name: true, email: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
    const todaysessionlist = sessions.map((s: SessionWithTrainer) => ({
      id: s.id,
      sessionId: s.id,
      sessionName: s.activityName ?? 'Session',
      trainerName: s.trainer.name ?? s.trainer.email,
      scheduledAt: s.scheduledAt.toISOString(),
    }));
    return { mtype: 'success', message: 'OK', todaysessionlist };
  }

  /**
   * Single API call that returns all data needed for the customer dashboard:
   * today's sessions, upcoming sessions, activity list (categories), favourite activities,
   * trending activities, and favourite trainers.
   */
  async getDashboardData(userId: string) {
    const [
      todayResult,
      upcomingResult,
      activityList,
      favouriteResult,
      trendingResult,
      favouriteTrainersList,
    ] = await Promise.all([
      this.todaysessionlist(userId),
      this.customerSessionList(userId),
      this.getActivityCategoryList(),
      this.fetchFavouriteActivities(userId),
      this.GetTrendingActivities(),
      this.fetchFavouriteTrainersList(userId),
    ]);
    return {
      mtype: 'success' as const,
      message: 'OK' as const,
      todaysessionlist: (todayResult as { todaysessionlist: unknown[] }).todaysessionlist,
      customerSessionList: (upcomingResult as { customerSessionList: unknown[] })
        .customerSessionList,
      activityList,
      favouriteActivities: (favouriteResult as { favouriteActivities: unknown[] })
        .favouriteActivities,
      trendingActivities: (trendingResult as { trendingActivities: unknown[] }).trendingActivities,
      favouriteTrainersList,
    };
  }

  /** Same as fetchSessionDetails: view a session the customer owns. */
  async ViewSession(userId: string, sessionId: string) {
    return this.fetchSessionDetails(userId, sessionId);
  }

  async fetchSessionDetails(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, customerId: userId },
      include: {
        trainer: { select: { id: true, name: true, email: true, phone: true, countryCode: true } },
        trainerSessionLocation: true,
      },
    });
    if (!session) return { mtype: 'error', message: 'Session not found' };
    const trainerCountry = session.trainer.countryCode?.toUpperCase();
    const trainerCurrency = (trainerCountry && COUNTRY_TO_CURRENCY[trainerCountry]) || 'usd';
    const now = new Date();
    const scheduledAt = session.scheduledAt.getTime();
    const thirtyMinMs = 30 * 60 * 1000;
    const isWithinTrackingWindow =
      session.status === 'scheduled' &&
      now.getTime() >= scheduledAt - thirtyMinMs &&
      now.getTime() <= scheduledAt + thirtyMinMs; // show location up to 30 mins after start so customer sees last update
    const loc = isWithinTrackingWindow ? session.trainerSessionLocation : null;
    const out: Record<string, unknown> = {
      mtype: 'success',
      message: 'OK',
      id: session.id,
      sessionId: session.id,
      sessionName: session.activityName ?? 'Session',
      trainerId: session.trainerId,
      trainerName: session.trainer.name ?? session.trainer.email,
      trainerEmail: session.trainer.email,
      trainerPhone: session.trainer.phone,
      trainerCountryCode: session.trainer.countryCode ?? undefined,
      trainerCurrency,
      scheduledAt: session.scheduledAt.toISOString(),
      status: session.status,
      amountCents: session.amountCents,
      createdAt: session.createdAt.toISOString(),
    };
    if (loc) {
      out.trainerLatitude = loc.latitude;
      out.trainerLongitude = loc.longitude;
      out.trainerLocationUpdatedAt = loc.updatedAt.toISOString();
    }
    return out;
  }

  async cancelSession(userId: string, sessionId: string, _reason?: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, customerId: userId },
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
      where: { id: sessionId, customerId: userId },
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

  /** List of trainers (for session booking). Optional latitude/longitude/radiusKm filter by service area. */
  async SessionTrainersList(body?: { latitude?: number; longitude?: number; radiusKm?: number }) {
    const lat = body?.latitude;
    const lon = body?.longitude;
    const radiusKm = body?.radiusKm ?? DEFAULT_LOCATION_RADIUS_KM;
    let trainerIds: string[] | null = null;
    if (
      typeof lat === 'number' &&
      typeof lon === 'number' &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lon)
    ) {
      trainerIds = await getTrainerIdsAtLocation(this.prisma, lat, lon, radiusKm);
    }
    const where =
      trainerIds !== null && trainerIds.length > 0
        ? { role: 'trainer' as const, id: { in: trainerIds } }
        : trainerIds !== null && trainerIds.length === 0
          ? { role: 'trainer' as const, id: { in: [] } }
          : { role: 'trainer' as const };
    const users = await this.prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, phone: true },
      orderBy: { createdAt: 'desc' },
    });
    const SessionTrainersList = users.map((u: UserSelect) => ({
      id: u.id,
      trainerId: u.id,
      trainerName: u.name ?? u.email,
      name: u.name ?? u.email,
      email: u.email,
      phone: u.phone,
    }));
    return { mtype: 'success', message: 'OK', SessionTrainersList, list: SessionTrainersList };
  }

  /** Check if trainer has availability at given date (and optional time). Uses TrainerAvailability and excludes existing scheduled sessions. */
  async CheckTrainerAvailability(trainerId: string, dateStr?: string, timeStr?: string) {
    if (!trainerId) return { mtype: 'error', message: 'Trainer ID required' };
    const trainer = await this.prisma.user.findFirst({ where: { id: trainerId, role: 'trainer' } });
    if (!trainer) return { mtype: 'error', message: 'Trainer not found' };
    const date = dateStr ? new Date(dateStr) : new Date();
    if (Number.isNaN(date.getTime())) return { mtype: 'error', message: 'Invalid date' };
    const dayOfWeek = date.getDay();
    const slots = await this.prisma.trainerAvailability.findMany({
      where: { trainerId, dayOfWeek },
    });
    if (slots.length === 0) return { mtype: 'success', message: 'OK', available: false };

    // Use UTC for default "now" time so conflict check matches scheduledAt (stored as UTC)
    const time =
      timeStr ??
      (dateStr
        ? null
        : `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`);
    if (time) {
      const inSlot = slots.some(
        (s: { startTime: string; endTime: string }) => time >= s.startTime && time < s.endTime
      );
      if (!inSlot) return { mtype: 'success', message: 'OK', available: false };
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const [h, m] = time.split(':').map(Number);
      const existingSessions = await this.prisma.session.findMany({
        where: {
          trainerId,
          status: 'scheduled',
          scheduledAt: {
            gte: startOfDay,
            lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        select: { scheduledAt: true },
      });
      const reqSlot = Math.floor((h * 60 + m) / 30);
      for (const s of existingSessions) {
        const existingSlot = Math.floor(
          (s.scheduledAt.getUTCHours() * 60 + s.scheduledAt.getUTCMinutes()) / 30
        );
        if (existingSlot === reqSlot) return { mtype: 'success', message: 'OK', available: false };
      }
    }
    return { mtype: 'success', message: 'OK', available: true };
  }

  /** Next N days where trainer has at least one availability slot. */
  async SessionAvailabilityDateList(trainerId: string, limit = 30) {
    if (!trainerId)
      return { mtype: 'success', message: 'OK', SessionAvailabilityDateList: [], list: [] };
    const trainer = await this.prisma.user.findFirst({ where: { id: trainerId, role: 'trainer' } });
    if (!trainer) return { mtype: 'error', message: 'Trainer not found' };
    const slots = await this.prisma.trainerAvailability.findMany({
      where: { trainerId },
      select: { dayOfWeek: true },
    });
    const availableDays = [...new Set(slots.map((s: { dayOfWeek: number }) => s.dayOfWeek))];
    if (availableDays.length === 0)
      return { mtype: 'success', message: 'OK', SessionAvailabilityDateList: [], list: [] };

    const out: string[] = [];
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    for (let i = 0; i < limit; i++) {
      const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      if (availableDays.includes(d.getDay())) out.push(d.toISOString().slice(0, 10));
    }
    return { mtype: 'success', message: 'OK', SessionAvailabilityDateList: out, list: out };
  }

  /** Time slots (HH:mm) for a given date within trainer availability, excluding booked sessions. 30-min slots. */
  async SessionAvailabilityTimeList(trainerId: string, dateStr: string) {
    if (!trainerId || !dateStr)
      return { mtype: 'success', message: 'OK', SessionAvailabilityTimeList: [], list: [] };
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return { mtype: 'error', message: 'Invalid date' };
    const trainer = await this.prisma.user.findFirst({ where: { id: trainerId, role: 'trainer' } });
    if (!trainer) return { mtype: 'error', message: 'Trainer not found' };
    const dayOfWeek = date.getDay();
    const slots = await this.prisma.trainerAvailability.findMany({
      where: { trainerId, dayOfWeek },
    });
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    const existingSessions = await this.prisma.session.findMany({
      where: { trainerId, status: 'scheduled', scheduledAt: { gte: startOfDay, lt: endOfDay } },
      select: { scheduledAt: true },
    });
    const bookedMinutes = new Set(
      existingSessions.map(
        (s: { scheduledAt: Date }) =>
          s.scheduledAt.getUTCHours() * 60 + Math.floor(s.scheduledAt.getUTCMinutes() / 30) * 30
      )
    );

    const timeSet = new Set<string>();
    for (const slot of slots) {
      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);
      let min = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      while (min < endMin) {
        const h = Math.floor(min / 60);
        const m = min % 60;
        const t = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        if (!bookedMinutes.has(min)) timeSet.add(t);
        min += 30;
      }
    }
    const SessionAvailabilityTimeList = [...timeSet].sort();
    return {
      mtype: 'success',
      message: 'OK',
      SessionAvailabilityTimeList,
      list: SessionAvailabilityTimeList,
    };
  }

  async addSession(userId: string, trainerId: string, scheduledAt: string, activityName?: string) {
    const trainer = await this.prisma.user.findFirst({
      where: { id: trainerId, role: 'trainer' },
    });
    if (!trainer) return { mtype: 'error', message: 'Trainer not found' };
    const date = new Date(scheduledAt);
    if (Number.isNaN(date.getTime())) return { mtype: 'error', message: 'Invalid date/time' };
    const session = await this.prisma.session.create({
      data: {
        customerId: userId,
        trainerId,
        scheduledAt: date,
        status: 'scheduled',
        activityName: activityName ?? null,
      },
    });
    const trainerName = trainer.name ?? trainer.email;
    await this.prisma.notification.create({
      data: {
        userId,
        title: 'Session booked',
        body: `Your session with ${trainerName} on ${date.toLocaleString()} is confirmed.${activityName ? ` Activity: ${activityName}.` : ''}`,
        read: false,
      },
    });
    await this.prisma.notification.create({
      data: {
        userId: trainerId,
        title: 'New session booked',
        body: `A customer booked a session on ${date.toLocaleString()}.${activityName ? ` Activity: ${activityName}.` : ''}`,
        read: false,
      },
    });
    return { mtype: 'success', message: 'Session booked', sessionId: session.id };
  }

  // Activities (from Activity table; fallback to ACTIVITY_TYPES if table empty)
  async fetchactivitytype() {
    const list = await this.getActivityListFromDb();
    return { mtype: 'success', message: 'OK', customerActivityList: list };
  }

  async fetchAllActivity() {
    const activityList = await this.getActivityCategoryList();
    return { mtype: 'success', message: 'OK', activityList };
  }

  /** Activities offered by trainers who serve the given location. Same activityList shape. Optional lat/lon/radiusKm. */
  async activitiesAtLocation(body?: { latitude?: number; longitude?: number; radiusKm?: number }) {
    const lat = body?.latitude;
    const lon = body?.longitude;
    const radiusKm = body?.radiusKm ?? DEFAULT_LOCATION_RADIUS_KM;
    if (
      typeof lat !== 'number' ||
      typeof lon !== 'number' ||
      Number.isNaN(lat) ||
      Number.isNaN(lon)
    ) {
      return this.fetchAllActivity();
    }
    const trainerIds = await getTrainerIdsAtLocation(this.prisma, lat, lon, radiusKm);
    if (trainerIds.length === 0) {
      return { mtype: 'success', message: 'OK', activityList: [] };
    }
    const trainerActivities = await this.prisma.trainerActivity.findMany({
      where: { trainerId: { in: trainerIds } },
      select: { activityCode: true },
      distinct: ['activityCode'],
    });
    const codes = trainerActivities.map((r: { activityCode: string }) => r.activityCode);
    if (codes.length === 0) {
      return { mtype: 'success', message: 'OK', activityList: [] };
    }
    const rows = await this.prisma.activity.findMany({
      where: { code: { in: codes } },
      orderBy: { code: 'asc' },
    });
    const activityList = rows.map(
      (a: { id: string; code: string; name: string; description: string | null }) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        activityName: a.name,
        description: a.description ?? '',
      })
    );
    return { mtype: 'success', message: 'OK', activityList };
  }

  async viewActivity(activityId?: string) {
    if (activityId) {
      const code = String(activityId).toLowerCase();
      const byId = await this.prisma.activity.findUnique({ where: { id: activityId } });
      const byCode =
        code !== activityId ? await this.prisma.activity.findUnique({ where: { code } }) : null;
      const one = byId ?? byCode ?? null;
      if (one) {
        return {
          mtype: 'success',
          message: 'OK',
          id: one.id,
          code: one.code,
          name: one.name,
          activityName: one.name,
          description: one.description ?? '',
          logoUrl: one.logoUrl ?? undefined,
          defaultPriceCents: one.defaultPriceCents ?? undefined,
        };
      }
    }
    const list = await this.getActivityListFromDb();
    const first = list[0];
    if (first)
      return { mtype: 'success', message: 'OK', ...first, description: first.description ?? '' };
    return {
      mtype: 'success',
      message: 'OK',
      activityName: 'Activity',
      id: activityId,
      description: '',
    };
  }

  private async getActivityListFromDb(): Promise<
    {
      id: string;
      code: string;
      name: string;
      activityName: string;
      description?: string;
      logoUrl?: string | null;
      defaultPriceCents?: number | null;
    }[]
  > {
    const rows = await this.prisma.activity.findMany({ orderBy: { code: 'asc' } });
    return rows.map(
      (a: {
        id: string;
        code: string;
        name: string;
        description: string | null;
        logoUrl: string | null;
        defaultPriceCents: number | null;
      }) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        activityName: a.name,
        description: a.description ?? '',
        logoUrl: a.logoUrl ?? undefined,
        defaultPriceCents: a.defaultPriceCents ?? undefined,
      })
    );
  }

  private async getActivityCategoryList(): Promise<
    {
      id: string;
      name: string;
      activityName: string;
      logoUrl?: string | null;
    }[]
  > {
    const rows = await this.prisma.activityCategory.findMany({ orderBy: { name: 'asc' } });
    return rows.map((a: { id: string; name: string; iconUrl: string | null }) => ({
      id: a.id,
      name: a.name,
      activityName: a.name,
      logoUrl: a.iconUrl ?? undefined,
    }));
  }

  /** List activity categories (e.g. Cardio, Strength) for customer. */
  async fetchActivityCategories() {
    const list = await this.getActivityCategoryList();
    return { mtype: 'success', message: 'OK', activityCategories: list };
  }

  /** Activities in a given category (Activity.activityGroup matches category name). */
  async fetchActivitiesByCategory(categoryId?: string) {
    if (!categoryId?.trim()) {
      return { mtype: 'success', message: 'OK', activityList: [] };
    }
    const category = await this.prisma.activityCategory.findUnique({
      where: { id: categoryId.trim() },
    });
    if (!category) {
      return { mtype: 'success', message: 'OK', activityList: [] };
    }
    const activities = await this.prisma.activity.findMany({
      where: { activityGroup: category.name },
      orderBy: { code: 'asc' },
    });
    const activityList = activities.map(
      (a: {
        id: string;
        code: string;
        name: string;
        description: string | null;
        logoUrl: string | null;
      }) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        activityName: a.name,
        description: a.description ?? '',
        logoUrl: a.logoUrl ?? undefined,
      })
    );
    return {
      mtype: 'success',
      message: 'OK',
      categoryName: category.name,
      activityList,
    };
  }

  async fetchFavouriteActivities(userId: string) {
    const rows = await this.prisma.customerFavouriteActivity.findMany({
      where: { customerId: userId },
      select: { activityCode: true },
    });
    const codes = rows.map((r: { activityCode: string }) => r.activityCode);
    if (codes.length === 0) return { mtype: 'success', message: 'OK', favouriteActivities: [] };
    const activities = await this.prisma.activity.findMany({ where: { code: { in: codes } } });
    const favouriteActivities = activities.map(
      (a: { id: string; code: string; name: string; logoUrl: string | null }) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        activityName: a.name,
        logoUrl: a.logoUrl ?? undefined,
      })
    );
    return { mtype: 'success', message: 'OK', favouriteActivities };
  }

  async addFavouriteActivity(userId: string, activityCode: string) {
    const code = String(activityCode ?? '').toLowerCase();
    const activity = await this.prisma.activity.findUnique({ where: { code } });
    if (!activity) return { mtype: 'error', message: 'Invalid activity code' };
    await this.prisma.customerFavouriteActivity.upsert({
      where: {
        customerId_activityCode: { customerId: userId, activityCode: code },
      },
      create: { customerId: userId, activityCode: code },
      update: {},
    });
    return { mtype: 'success', message: 'OK' };
  }

  async removeFavouriteActivity(userId: string, activityCode: string) {
    const code = String(activityCode ?? '').toLowerCase();
    await this.prisma.customerFavouriteActivity.deleteMany({
      where: { customerId: userId, activityCode: code },
    });
    return { mtype: 'success', message: 'OK' };
  }

  /** Activity list for customer (same as fetchAllActivity activityList shape). */
  async customerActivityList() {
    const list = await this.getActivityListFromDb();
    return { mtype: 'success', message: 'OK', customerActivityList: list };
  }

  async GetTrendingActivities() {
    const rows = await this.prisma.activity.findMany({
      orderBy: { code: 'asc' },
      take: 10,
    });
    const trendingActivities = rows.map(
      (a: { id: string; code: string; name: string; logoUrl: string | null }) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        activityName: a.name,
        logoUrl: a.logoUrl ?? undefined,
      })
    );
    return { mtype: 'success', message: 'OK', trendingActivities };
  }

  // Trainers (toprated = all trainers; favourite = stub for now)
  async viewTrainer(trainerId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: trainerId,
        role: 'trainer',
        isActive: true,
        trainerProfileCompleteAt: { not: null },
      },
      include: {
        socialLinks: true,
        additionalImages: { orderBy: { sortOrder: 'asc' } },
        trainerActivities: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!user) return { mtype: 'error', message: 'Trainer not found' };
    const activityCodes = user.trainerActivities.map(
      (a: { activityCode: string }) => a.activityCode
    );
    const activities =
      activityCodes.length > 0
        ? await this.prisma.activity.findMany({
            where: { code: { in: activityCodes } },
            select: { code: true, name: true },
          })
        : [];
    const nameByCode = Object.fromEntries(
      activities.map((a: { code: string; name: string }) => [a.code, a.name])
    );
    const specializations = user.trainerActivities.map(
      (a: { activityCode: string }) => nameByCode[a.activityCode] ?? a.activityCode
    );
    const [sessionsCompleted, reviewAgg] = await Promise.all([
      this.prisma.session.count({
        where: { trainerId: user.id, status: 'completed' },
      }),
      this.prisma.review.aggregate({
        where: { trainerId: user.id },
        _avg: { rating: true },
        _count: true,
      }),
    ]);
    const rating = reviewAgg._count > 0 ? Math.round((reviewAgg._avg.rating ?? 0) * 10) / 10 : 0;
    const socialLinks = user.socialLinks
      ? {
          facebookId: user.socialLinks.facebookId,
          instagramId: user.socialLinks.instagramId,
          tiktokId: user.socialLinks.tiktokId,
          twitterId: user.socialLinks.twitterId,
          youtubeId: user.socialLinks.youtubeId,
        }
      : null;
    return {
      mtype: 'success',
      message: 'OK',
      id: user.id,
      trainerId: user.id,
      trainerName: user.name ?? user.email,
      name: user.name ?? user.email,
      email: user.email,
      phone: user.phone ?? '',
      avatarUrl: user.avatarUrl ?? null,
      about: user.about ?? null,
      yearsExperience: user.yearsExperience ?? null,
      languageSpoken: user.languageSpoken ?? null,
      socialLinks,
      additionalImages: user.additionalImages.map((img: { id: string; imageUrl: string }) => ({
        id: img.id,
        imageUrl: img.imageUrl,
      })),
      specializations,
      sessionsCompleted,
      rating,
      reviewCount: reviewAgg._count,
    };
  }

  /** Top rated trainers. Optional latitude/longitude/radiusKm filter by service area. Only trainers with completed profile and admin-approved (isActive) are visible. */
  async topratedTrainersList(body?: { latitude?: number; longitude?: number; radiusKm?: number }) {
    const lat = body?.latitude;
    const lon = body?.longitude;
    const radiusKm = body?.radiusKm ?? DEFAULT_LOCATION_RADIUS_KM;
    let trainerIds: string[] | null = null;
    if (
      typeof lat === 'number' &&
      typeof lon === 'number' &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lon)
    ) {
      trainerIds = await getTrainerIdsAtLocation(this.prisma, lat, lon, radiusKm);
    }
    const baseWhere = {
      role: 'trainer' as const,
      isActive: true,
      trainerProfileCompleteAt: { not: null } as const,
    };
    const where =
      trainerIds !== null && trainerIds.length > 0
        ? { ...baseWhere, id: { in: trainerIds } }
        : trainerIds !== null && trainerIds.length === 0
          ? { ...baseWhere, id: { in: [] } }
          : baseWhere;
    const users = await this.prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, phone: true },
      orderBy: { createdAt: 'desc' },
    });
    const topratedTrainersList = users.map((u: UserSelect) => ({
      id: u.id,
      trainerId: u.id,
      trainerName: u.name ?? u.email,
      name: u.name ?? u.email,
      email: u.email,
      phone: u.phone,
    }));
    return { mtype: 'success', message: 'OK', topratedTrainersList };
  }

  async favouriteTrainersList(userId: string) {
    const list = await this.fetchFavouriteTrainersList(userId);
    return { mtype: 'success', message: 'OK', favouriteTrainersList: list };
  }

  async fetchFavouriteTrainers(userId: string) {
    const list = await this.fetchFavouriteTrainersList(userId);
    return { mtype: 'success', message: 'OK', favouriteTrainersList: list };
  }

  private async fetchFavouriteTrainersList(userId: string) {
    const rows = await this.prisma.customerFavouriteTrainer.findMany({
      where: { customerId: userId },
      select: { trainerId: true },
    });
    const trainerIds = rows.map((r: { trainerId: string }) => r.trainerId);
    if (trainerIds.length === 0) return [];
    const users = await this.prisma.user.findMany({
      where: { id: { in: trainerIds }, role: 'trainer' },
      select: { id: true, name: true, email: true, phone: true },
    });
    return users.map((u: UserSelect) => ({
      id: u.id,
      trainerId: u.id,
      trainerName: u.name ?? u.email,
      name: u.name ?? u.email,
      email: u.email,
      phone: u.phone,
    }));
  }

  async addFavouriteTrainer(userId: string, trainerId: string) {
    const trainer = await this.prisma.user.findFirst({
      where: { id: trainerId, role: 'trainer' },
    });
    if (!trainer) return { mtype: 'error', message: 'Trainer not found' };
    await this.prisma.customerFavouriteTrainer.upsert({
      where: {
        customerId_trainerId: { customerId: userId, trainerId },
      },
      create: { customerId: userId, trainerId },
      update: {},
    });
    return { mtype: 'success', message: 'OK' };
  }

  async deletefavouriteTrainer(userId: string, trainerId: string) {
    await this.prisma.customerFavouriteTrainer.deleteMany({
      where: { customerId: userId, trainerId },
    });
    return { mtype: 'success', message: 'OK' };
  }

  async getTrainerAvgRating(trainerId: string) {
    if (!trainerId?.trim()) return { mtype: 'success', rating: 0, reviewCount: 0 };
    const agg = await this.prisma.review.aggregate({
      where: { trainerId: trainerId.trim() },
      _avg: { rating: true },
      _count: true,
    });
    const rating = agg._count > 0 ? Math.round((agg._avg.rating ?? 0) * 10) / 10 : 0;
    return { mtype: 'success', message: 'OK', rating, reviewCount: agg._count };
  }

  async fetchTrainerRelatedReviews(trainerId: string) {
    if (!trainerId?.trim())
      return { mtype: 'success', message: 'OK', list: [], fetchTrainerRelatedReviews: [] };
    const reviews = await this.prisma.review.findMany({
      where: { trainerId: trainerId.trim() },
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
    return { mtype: 'success', message: 'OK', list, fetchTrainerRelatedReviews: list };
  }

  // Service area / locations (customer) – CustomerLocation model
  async customerServiceList(userId: string) {
    const rows = await this.prisma.customerLocation.findMany({
      where: { customerId: userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    const customerServiceList = rows.map((r) => ({
      id: r.id,
      label: r.label,
      address: r.address ?? '',
      streetLine1: r.streetLine1 ?? undefined,
      streetLine2: r.streetLine2 ?? undefined,
      city: r.city ?? undefined,
      stateProvince: r.stateProvince ?? undefined,
      postalCode: r.postalCode ?? undefined,
      country: r.country ?? undefined,
      latitude: r.latitude,
      longitude: r.longitude,
      isDefault: r.isDefault,
      createdAt: r.createdAt.toISOString(),
    }));
    return { mtype: 'success', message: 'OK', customerServiceList, list: customerServiceList };
  }

  async addCustomerService(
    userId: string,
    label: string,
    address?: string | null,
    streetLine1?: string | null,
    streetLine2?: string | null,
    city?: string | null,
    stateProvince?: string | null,
    postalCode?: string | null,
    country?: string | null,
    latitude?: number | null,
    longitude?: number | null
  ) {
    const labelNorm = String(label ?? '').trim();
    if (!labelNorm) return { mtype: 'error', message: 'Label is required' };
    const loc = await this.prisma.customerLocation.create({
      data: {
        customerId: userId,
        label: labelNorm,
        address: address?.trim() || null,
        streetLine1: streetLine1?.trim() || null,
        streetLine2: streetLine2?.trim() || null,
        city: city?.trim() || null,
        stateProvince: stateProvince?.trim() || null,
        postalCode: postalCode?.trim() || null,
        country: country?.trim() || null,
        latitude: latitude != null ? Number(latitude) : null,
        longitude: longitude != null ? Number(longitude) : null,
      },
    });
    return { mtype: 'success', message: 'OK', id: loc.id };
  }

  async viewServiceArea(userId: string, locationId: string) {
    if (!locationId?.trim()) return { mtype: 'error', message: 'Location id is required' };
    const loc = await this.prisma.customerLocation.findFirst({
      where: { id: locationId.trim(), customerId: userId },
    });
    if (!loc) return { mtype: 'error', message: 'Location not found' };
    return {
      mtype: 'success',
      message: 'OK',
      id: loc.id,
      label: loc.label,
      address: loc.address ?? '',
      streetLine1: loc.streetLine1 ?? undefined,
      streetLine2: loc.streetLine2 ?? undefined,
      city: loc.city ?? undefined,
      stateProvince: loc.stateProvince ?? undefined,
      postalCode: loc.postalCode ?? undefined,
      country: loc.country ?? undefined,
      latitude: loc.latitude,
      longitude: loc.longitude,
      createdAt: loc.createdAt.toISOString(),
    };
  }

  async editCustomerService(
    userId: string,
    locationId: string,
    label?: string,
    address?: string | null,
    streetLine1?: string | null,
    streetLine2?: string | null,
    city?: string | null,
    stateProvince?: string | null,
    postalCode?: string | null,
    country?: string | null,
    latitude?: number | null,
    longitude?: number | null
  ) {
    if (!locationId?.trim()) return { mtype: 'error', message: 'Location id is required' };
    const loc = await this.prisma.customerLocation.findFirst({
      where: { id: locationId.trim(), customerId: userId },
    });
    if (!loc) return { mtype: 'error', message: 'Location not found' };
    const labelNorm = label !== undefined ? String(label).trim() : undefined;
    if (labelNorm !== undefined && !labelNorm)
      return { mtype: 'error', message: 'Label cannot be empty' };
    await this.prisma.customerLocation.update({
      where: { id: locationId.trim() },
      data: {
        ...(labelNorm !== undefined && { label: labelNorm }),
        ...(address !== undefined && { address: address?.trim() || null }),
        ...(streetLine1 !== undefined && { streetLine1: streetLine1?.trim() || null }),
        ...(streetLine2 !== undefined && { streetLine2: streetLine2?.trim() || null }),
        ...(city !== undefined && { city: city?.trim() || null }),
        ...(stateProvince !== undefined && { stateProvince: stateProvince?.trim() || null }),
        ...(postalCode !== undefined && { postalCode: postalCode?.trim() || null }),
        ...(country !== undefined && { country: country?.trim() || null }),
        ...(latitude !== undefined && { latitude: latitude != null ? Number(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude != null ? Number(longitude) : null }),
      },
    });
    return { mtype: 'success', message: 'OK' };
  }

  async deleteCustomerService(userId: string, locationId: string) {
    if (!locationId?.trim()) return { mtype: 'error', message: 'Location id is required' };
    const loc = await this.prisma.customerLocation.findFirst({
      where: { id: locationId.trim(), customerId: userId },
    });
    if (!loc) return { mtype: 'error', message: 'Location not found' };
    await this.prisma.customerLocation.delete({ where: { id: locationId.trim() } });
    return { mtype: 'success', message: 'OK' };
  }

  async setDefaultCustomerLocation(userId: string, locationId: string) {
    if (!locationId?.trim()) return { mtype: 'error', message: 'Location id is required' };
    const loc = await this.prisma.customerLocation.findFirst({
      where: { id: locationId.trim(), customerId: userId },
    });
    if (!loc) return { mtype: 'error', message: 'Location not found' };
    await this.prisma.$transaction([
      this.prisma.customerLocation.updateMany({
        where: { customerId: userId },
        data: { isDefault: false },
      }),
      this.prisma.customerLocation.update({
        where: { id: locationId.trim() },
        data: { isDefault: true },
      }),
    ]);
    return { mtype: 'success', message: 'OK' };
  }

  // Payments: list sessions where customer paid (amountCents set)
  async PaymentList(userId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { customerId: userId, amountCents: { not: null } },
      orderBy: { scheduledAt: 'desc' },
      select: {
        id: true,
        scheduledAt: true,
        amountCents: true,
        status: true,
        createdAt: true,
        activityName: true,
      },
    });
    const list = sessions.map(
      (s: {
        id: string;
        scheduledAt: Date;
        amountCents: number | null;
        status: string;
        createdAt: Date;
        activityName: string | null;
      }) => ({
        id: s.id,
        sessionId: s.id,
        date: s.scheduledAt.toISOString().slice(0, 10),
        createdAt: s.createdAt.toISOString(),
        amount: s.amountCents != null ? s.amountCents / 100 : 0,
        amountCents: s.amountCents,
        status: s.status,
        activityName: s.activityName ?? undefined,
      })
    );
    return { mtype: 'success', message: 'OK', PaymentList: list, list };
  }

  async PaymentStatus(paymentIntentId?: string) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key?.startsWith('sk_') || !paymentIntentId?.trim()) {
      return { mtype: 'success', message: 'OK', status: 'pending' };
    }
    try {
      const stripeMod = await import(STRIPE_MODULE);
      const Stripe = (
        stripeMod as {
          default: new (
            key: string,
            opts?: { apiVersion: string }
          ) => { paymentIntents: { retrieve: (id: string) => Promise<{ status: string }> } };
        }
      ).default;
      const stripe = new Stripe(key, { apiVersion: '2023-10-16' });
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId.trim());
      return { mtype: 'success', message: 'OK', status: pi.status };
    } catch {
      return { mtype: 'success', message: 'OK', status: 'pending' };
    }
  }

  async PaymentSheet(amountCents?: number, currency?: string) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key?.startsWith('sk_')) {
      return { mtype: 'success', message: 'OK', clientSecret: null };
    }
    const amount = Math.max(0, Math.round(Number(amountCents ?? 0) || 0));
    const cur = (currency ?? 'usd').toLowerCase();
    try {
      const stripeMod = await import(STRIPE_MODULE);
      const Stripe = (
        stripeMod as {
          default: new (
            key: string,
            opts?: { apiVersion: string }
          ) => {
            paymentIntents: {
              create: (opts: unknown) => Promise<{ client_secret: string | null }>;
            };
          };
        }
      ).default;
      const stripe = new Stripe(key, { apiVersion: '2023-10-16' });
      const pi = await stripe.paymentIntents.create({
        amount: amount || 100, // minimum 100 cents if 0
        currency: cur,
        automatic_payment_methods: { enabled: true },
      });
      return { mtype: 'success', message: 'OK', clientSecret: pi.client_secret };
    } catch {
      return { mtype: 'success', message: 'OK', clientSecret: null };
    }
  }

  async sessionPayment(sessionId?: string, paymentIntentId?: string) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key?.startsWith('sk_') || !paymentIntentId?.trim()) {
      return { mtype: 'success', message: 'OK' };
    }
    try {
      const stripeMod = await import(STRIPE_MODULE);
      const Stripe = (
        stripeMod as {
          default: new (
            key: string,
            opts?: { apiVersion: string }
          ) => {
            paymentIntents: {
              retrieve: (id: string) => Promise<{ status: string; amount?: number }>;
            };
          };
        }
      ).default;
      const stripe = new Stripe(key, { apiVersion: '2023-10-16' });
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId.trim());
      if (pi.status === 'succeeded') {
        if (sessionId?.trim()) {
          const session = await this.prisma.session.findFirst({
            where: { id: sessionId.trim() },
            select: { id: true, amountCents: true },
          });
          if (session)
            await this.prisma.session.update({
              where: { id: session.id },
              data: { amountCents: session.amountCents ?? pi.amount ?? 0 },
            });
        }
        return { mtype: 'success', message: 'OK', paid: true };
      }
      return { mtype: 'success', message: 'OK', paid: false };
    } catch {
      return { mtype: 'success', message: 'OK' };
    }
  }

  // Notifications*
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

  // FAQ / Help (from Faq master data)
  async faqlist() {
    const rows = await this.prisma.faq.findMany({
      where: { role: 'customer' },
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
    const row = await this.prisma.contactLink.findMany({});
    return {
      mtype: 'success',
      message: 'OK',
      data: row,
    };
  }

  // Reviews
  async customerreview(
    customerId: string,
    trainerId: string,
    rating: number,
    comment?: string | null,
    sessionId?: string | null
  ) {
    const trainerIdNorm = String(trainerId ?? '').trim();
    if (!trainerIdNorm) return { mtype: 'error', message: 'Trainer is required' };
    const r = Number(rating);
    if (Number.isNaN(r) || r < 1 || r > 5) return { mtype: 'error', message: 'Rating must be 1-5' };
    const trainer = await this.prisma.user.findFirst({
      where: { id: trainerIdNorm, role: 'trainer' },
    });
    if (!trainer) return { mtype: 'error', message: 'Trainer not found' };
    await this.prisma.review.create({
      data: {
        trainerId: trainerIdNorm,
        customerId,
        sessionId: sessionId?.trim() || null,
        rating: Math.round(r),
        comment: comment?.trim() || null,
      },
    });
    return { mtype: 'success', message: 'OK' };
  }

  /** Reviews for a trainer; body: trainerId. Same shape as fetchTrainerRelatedReviews. */
  async reviewlist(trainerId?: string) {
    const result = await this.fetchTrainerRelatedReviews(trainerId ?? '');
    const list = (result as { list?: unknown[] }).list ?? [];
    return { ...result, reviewlist: list };
  }

  // Discount / voucher (valid now: validFrom <= now, validTo >= now or null)
  async avialableDiscountList() {
    const now = new Date();
    const rows = await this.prisma.discount.findMany({
      where: {
        AND: [
          { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
          { OR: [{ validTo: null }, { validTo: { gte: now } }] },
        ],
      },
      orderBy: { code: 'asc' },
    });
    const list = rows.map(
      (d: {
        id: string;
        code: string;
        type: string;
        value: unknown;
        validFrom: Date | null;
        validTo: Date | null;
      }) => ({
        id: d.id,
        code: d.code,
        type: d.type,
        value: Number(d.value),
        validFrom: d.validFrom?.toISOString() ?? null,
        validTo: d.validTo?.toISOString() ?? null,
      })
    );
    return { mtype: 'success', message: 'OK', avialableDiscountList: list, list };
  }

  /** Validate discount code; body: code. Returns discount type and value if valid. */
  async checkDiscount(code?: string) {
    const c = String(code ?? '').trim();
    if (!c) return { mtype: 'error', message: 'Code required' };
    const discount = await this.prisma.discount.findUnique({ where: { code: c } });
    if (!discount) return { mtype: 'error', message: 'Invalid or expired code' };
    const now = new Date();
    if (discount.validFrom && discount.validFrom > now)
      return { mtype: 'error', message: 'Code not yet valid' };
    if (discount.validTo && discount.validTo < now)
      return { mtype: 'error', message: 'Code expired' };
    return {
      mtype: 'success',
      message: 'OK',
      valid: true,
      code: discount.code,
      type: discount.type,
      value: Number(discount.value),
    };
  }

  // File (stub until storage/upload implemented)
  fileUpload() {
    return { mtype: 'success', message: 'OK', profilepath: '', filecode: '' };
  }

  // Misc (contact list; empty by default, can be replaced by master data)
  contactList() {
    const contactList: { id?: string; name?: string; email?: string; phone?: string }[] = [];
    return { mtype: 'success', message: 'OK', contactList, list: contactList };
  }

  /** Invite user to group (same as addgroupmember). JWT + body: groupId, userId (member to add). */
  async GroupInvite(userId: string, groupId?: string, inviteUserId?: string) {
    return this.addgroupmember(userId, groupId ?? '', inviteUserId ?? '');
  }

  /** Submit "other concern" as a support ticket; JWT + body: subject?, message. */
  async otherConcern(userId: string, subject?: string, message?: string) {
    const subj = subject?.trim() || 'Other concern';
    const msg = message?.trim() || '';
    if (!msg) return { mtype: 'error', message: 'Message required' };
    return this.raiseSupport(userId, subj, msg);
  }

  async raiseSupport(userId: string, subject: string, message: string) {
    if (!subject?.trim() || !message?.trim())
      return { mtype: 'error', message: 'Subject and message required' };
    const ticket = await this.prisma.supportTicket.create({
      data: { userId, subject: subject.trim(), message: message.trim(), status: 'open' },
    });
    return { mtype: 'success', message: 'OK', ticketId: ticket.id };
  }
}
