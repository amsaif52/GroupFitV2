import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Session row with included customer and trainer (for sessionList map callback typing) */
interface SessionWithRelations {
  id: string;
  customerId: string;
  trainerId: string;
  activityName: string | null;
  scheduledAt: Date;
  status: string;
  amountCents: number | null;
  createdAt: Date;
  updatedAt: Date;
  customer: { id: string; email: string; name: string | null };
  trainer: { id: string; email: string; name: string | null };
}
/** SupportTicket row with included user (for supportList map callback typing) */
interface TicketWithUser {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; email: string; name: string | null; role: string };
}
/** Discount row (for discountList map callback typing) */
interface DiscountRow {
  id: string;
  code: string;
  type: string;
  value: unknown;
  validFrom: Date | null;
  validTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Safe user fields for admin list responses (no passwordHash, otp, etc.) */
const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  locale: true,
  phone: true,
  countryCode: true,
  state: true,
  trainerCanSetOwnPrice: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth() {
    return { division: 'admin', status: 'ok', timestamp: new Date().toISOString() };
  }

  /** Dashboard summary (counts from User + Session) */
  async dashboard() {
    const [userCount, trainerCount, customerCount, sessionCount, earningResult] = await Promise.all(
      [
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: 'trainer' } }),
        this.prisma.user.count({ where: { role: 'customer' } }),
        this.prisma.session.count(),
        this.prisma.session.aggregate({
          where: { status: 'completed' },
          _sum: { amountCents: true },
        }),
      ]
    );
    const earningTotal = earningResult._sum.amountCents ?? 0;
    return {
      mtype: 'success',
      message: 'OK',
      data: {
        userCount,
        trainerCount,
        customerCount,
        sessionCount,
        earningTotal,
      },
    };
  }

  /** All users (admin view) */
  async usersList() {
    const users = await this.prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });
    return { mtype: 'success', message: 'OK', list: users };
  }

  /** Single user by id (admin view) */
  async userDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });
    if (!user) return { mtype: 'error', message: 'User not found' };
    return { mtype: 'success', message: 'OK', ...user };
  }

  /** Users with role trainer */
  async trainerList() {
    const list = await this.prisma.user.findMany({
      where: { role: 'trainer' },
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });
    return { mtype: 'success', message: 'OK', list };
  }

  /** Users with role customer */
  async customerList() {
    const list = await this.prisma.user.findMany({
      where: { role: 'customer' },
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });
    return { mtype: 'success', message: 'OK', list };
  }

  async sessionDetail(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        customer: { select: { id: true, email: true, name: true } },
        trainer: { select: { id: true, email: true, name: true } },
      },
    });
    if (!session) return { mtype: 'error', message: 'Session not found' };
    return {
      mtype: 'success',
      message: 'OK',
      id: session.id,
      customerId: session.customerId,
      trainerId: session.trainerId,
      customerName: session.customer.name,
      customerEmail: session.customer.email,
      trainerName: session.trainer.name,
      trainerEmail: session.trainer.email,
      activityName: session.activityName,
      scheduledAt: session.scheduledAt.toISOString(),
      status: session.status,
      amountCents: session.amountCents,
      createdAt: session.createdAt.toISOString(),
    };
  }

  async sessionList() {
    const sessions = await this.prisma.session.findMany({
      include: {
        customer: { select: { id: true, email: true, name: true } },
        trainer: { select: { id: true, email: true, name: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
    const list = sessions.map((s: SessionWithRelations) => ({
      id: s.id,
      customerId: s.customerId,
      trainerId: s.trainerId,
      customerName: s.customer.name,
      customerEmail: s.customer.email,
      trainerName: s.trainer.name,
      trainerEmail: s.trainer.email,
      activityName: s.activityName,
      scheduledAt: s.scheduledAt.toISOString(),
      status: s.status,
      amountCents: s.amountCents,
      createdAt: s.createdAt.toISOString(),
    }));
    return { mtype: 'success', message: 'OK', list };
  }

  async supportList() {
    const tickets = await this.prisma.supportTicket.findMany({
      include: { user: { select: { id: true, email: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const list = tickets.map((t: TicketWithUser) => ({
      id: t.id,
      userId: t.userId,
      userEmail: t.user.email,
      userName: t.user.name,
      userRole: t.user.role,
      subject: t.subject,
      message: t.message,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    }));
    return { mtype: 'success', message: 'OK', list };
  }

  async supportDetail(supportId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: supportId },
      include: { user: { select: { id: true, email: true, name: true, role: true } } },
    });
    if (!ticket) return { mtype: 'error', message: 'Support ticket not found' };
    return {
      mtype: 'success',
      message: 'OK',
      id: ticket.id,
      userId: ticket.userId,
      userEmail: ticket.user.email,
      userName: ticket.user.name,
      userRole: ticket.user.role,
      subject: ticket.subject,
      body: ticket.message,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
    };
  }

  async discountList() {
    const discounts = await this.prisma.discount.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const list = discounts.map((d: DiscountRow) => ({
      id: d.id,
      code: d.code,
      type: d.type,
      value: Number(d.value),
      validFrom: d.validFrom?.toISOString() ?? null,
      validTo: d.validTo?.toISOString() ?? null,
      createdAt: d.createdAt.toISOString(),
    }));
    return { mtype: 'success', message: 'OK', list };
  }

  async discountDetail(discountId: string) {
    const discount = await this.prisma.discount.findUnique({
      where: { id: discountId },
    });
    if (!discount) return { mtype: 'error', message: 'Discount not found' };
    return {
      mtype: 'success',
      message: 'OK',
      id: discount.id,
      code: discount.code,
      type: discount.type,
      value: Number(discount.value),
      validFrom: discount.validFrom?.toISOString() ?? null,
      validTo: discount.validTo?.toISOString() ?? null,
      createdAt: discount.createdAt.toISOString(),
      updatedAt: discount.updatedAt.toISOString(),
    };
  }

  async createDiscount(
    code: string,
    type: string,
    value: number,
    validFrom?: string | null,
    validTo?: string | null
  ) {
    const codeNorm = String(code ?? '').trim();
    if (!codeNorm) return { mtype: 'error', message: 'Code is required' };
    const typeNorm = String(type ?? '').toLowerCase();
    if (typeNorm !== 'percent' && typeNorm !== 'fixed')
      return { mtype: 'error', message: 'Type must be percent or fixed' };
    const numValue = Number(value);
    if (Number.isNaN(numValue) || numValue < 0)
      return { mtype: 'error', message: 'Value must be a non-negative number' };
    const existing = await this.prisma.discount.findUnique({ where: { code: codeNorm } });
    if (existing) return { mtype: 'error', message: 'Discount code already exists' };
    const validFromDate = validFrom ? new Date(validFrom) : null;
    const validToDate = validTo ? new Date(validTo) : null;
    const discount = await this.prisma.discount.create({
      data: {
        code: codeNorm,
        type: typeNorm,
        value: numValue,
        validFrom: validFromDate ?? undefined,
        validTo: validToDate ?? undefined,
      },
    });
    return { mtype: 'success', message: 'OK', id: discount.id };
  }

  async updateDiscount(
    id: string,
    code?: string,
    type?: string,
    value?: number,
    validFrom?: string | null,
    validTo?: string | null
  ) {
    const discount = await this.prisma.discount.findUnique({ where: { id } });
    if (!discount) return { mtype: 'error', message: 'Discount not found' };
    const codeNorm = code !== undefined ? String(code).trim() : discount.code;
    if (codeNorm && codeNorm !== discount.code) {
      const existing = await this.prisma.discount.findUnique({ where: { code: codeNorm } });
      if (existing) return { mtype: 'error', message: 'Discount code already in use' };
    }
    const typeNorm = type !== undefined ? String(type).toLowerCase() : discount.type;
    if (typeNorm !== 'percent' && typeNorm !== 'fixed')
      return { mtype: 'error', message: 'Type must be percent or fixed' };
    const numValue = value !== undefined ? Number(value) : Number(discount.value);
    if (Number.isNaN(numValue) || numValue < 0)
      return { mtype: 'error', message: 'Value must be a non-negative number' };
    const validFromDate =
      validFrom !== undefined ? (validFrom ? new Date(validFrom) : null) : undefined;
    const validToDate = validTo !== undefined ? (validTo ? new Date(validTo) : null) : undefined;
    await this.prisma.discount.update({
      where: { id },
      data: {
        ...(code !== undefined && { code: codeNorm }),
        ...(type !== undefined && { type: typeNorm }),
        ...(value !== undefined && { value: numValue }),
        ...(validFrom !== undefined && { validFrom: validFromDate }),
        ...(validTo !== undefined && { validTo: validToDate }),
      },
    });
    return { mtype: 'success', message: 'OK' };
  }

  async deleteDiscount(id: string) {
    const discount = await this.prisma.discount.findUnique({ where: { id } });
    if (!discount) return { mtype: 'error', message: 'Discount not found' };
    await this.prisma.discount.delete({ where: { id } });
    return { mtype: 'success', message: 'OK' };
  }

  async earningReport() {
    const [sessionCount, completed] = await Promise.all([
      this.prisma.session.count(),
      this.prisma.session.aggregate({
        where: { status: 'completed' },
        _sum: { amountCents: true },
        _count: true,
      }),
    ]);
    const earningTotal = completed._sum.amountCents ?? 0;
    const data = {
      sessionCount,
      completedSessionCount: completed._count,
      earningTotalCents: earningTotal,
      earningTotalFormatted: `$${(earningTotal / 100).toFixed(2)}`,
    };
    return { mtype: 'success', message: 'OK', data };
  }

  /** Activity types (master data) */
  async activityList() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list = await (this.prisma.activity.findMany as any)({
      orderBy: { code: 'asc' },
      include: {
        createdBy: { select: { name: true, email: true } },
        updatedBy: { select: { name: true, email: true } },
      },
    });
    return {
      mtype: 'success',
      message: 'OK',
      list: list.map(
        (
          a: Record<string, unknown> & {
            id: string;
            code: string;
            name: string;
            description: string | null;
            defaultPriceCents: number | null;
            logoUrl?: string | null;
            activityGroup?: string | null;
            trainerSharePercent?: number | null;
            status?: string | null;
            createdAt: Date;
            updatedAt: Date;
            createdBy?: { name: string | null; email: string } | null;
            updatedBy?: { name: string | null; email: string } | null;
          }
        ) => ({
          id: a.id,
          code: a.code,
          name: a.name,
          description: a.description ?? '',
          defaultPriceCents: a.defaultPriceCents ?? undefined,
          logoUrl: a.logoUrl ?? undefined,
          activityGroup: a.activityGroup ?? undefined,
          trainerSharePercent: a.trainerSharePercent ?? undefined,
          status: a.status ?? 'active',
          createdBy: a.createdBy ? a.createdBy.name || a.createdBy.email : undefined,
          createdAt: a.createdAt.toISOString(),
          updatedBy: a.updatedBy ? a.updatedBy.name || a.updatedBy.email : undefined,
          updatedAt: a.updatedAt.toISOString(),
        })
      ),
    };
  }

  async createActivity(
    adminUserId: string,
    code: string,
    name: string,
    description?: string,
    defaultPriceCents?: number,
    logoUrl?: string,
    activityGroup?: string,
    trainerSharePercent?: number | null,
    status?: string | null
  ) {
    const codeNorm = String(code ?? '')
      .trim()
      .toLowerCase();
    if (!codeNorm || !name?.trim()) return { mtype: 'error', message: 'code and name required' };
    const existing = await this.prisma.activity.findUnique({ where: { code: codeNorm } });
    if (existing) return { mtype: 'error', message: 'Activity code already exists' };
    const activity = await this.prisma.activity.create({
      data: {
        code: codeNorm,
        name: name.trim(),
        description: description?.trim() || null,
        ...(defaultPriceCents !== undefined &&
          defaultPriceCents !== null && {
            defaultPriceCents: Math.max(0, Math.round(defaultPriceCents)),
          }),
        ...(logoUrl !== undefined && { logoUrl: logoUrl?.trim() || null }),
        ...(activityGroup !== undefined && { activityGroup: activityGroup?.trim() || null }),
        ...(trainerSharePercent !== undefined && {
          trainerSharePercent:
            trainerSharePercent == null
              ? null
              : Math.min(100, Math.max(0, Math.round(Number(trainerSharePercent)))),
        }),
        ...(status !== undefined && { status: status?.trim() || 'active' }),
        createdById: adminUserId,
        updatedById: adminUserId,
      } as Parameters<typeof this.prisma.activity.create>[0]['data'],
    });
    return { mtype: 'success', message: 'OK', id: activity.id };
  }

  async updateActivity(
    adminUserId: string,
    id: string,
    code?: string,
    name?: string,
    description?: string,
    defaultPriceCents?: number | null,
    logoUrl?: string | null,
    activityGroup?: string | null,
    trainerSharePercent?: number | null,
    status?: string | null
  ) {
    const activity = await this.prisma.activity.findUnique({ where: { id } });
    if (!activity) return { mtype: 'error', message: 'Activity not found' };
    const codeNorm = code !== undefined ? String(code).trim().toLowerCase() : activity.code;
    if (codeNorm && codeNorm !== activity.code) {
      const existing = await this.prisma.activity.findUnique({ where: { code: codeNorm } });
      if (existing) return { mtype: 'error', message: 'Activity code already in use' };
    }
    await this.prisma.activity.update({
      where: { id },
      data: {
        ...(code !== undefined && { code: codeNorm }),
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(defaultPriceCents !== undefined && {
          defaultPriceCents:
            defaultPriceCents == null ? null : Math.max(0, Math.round(Number(defaultPriceCents))),
        }),
        ...(logoUrl !== undefined && { logoUrl: logoUrl?.trim() || null }),
        ...(activityGroup !== undefined && { activityGroup: activityGroup?.trim() || null }),
        ...(trainerSharePercent !== undefined && {
          trainerSharePercent:
            trainerSharePercent == null
              ? null
              : Math.min(100, Math.max(0, Math.round(Number(trainerSharePercent)))),
        }),
        ...(status !== undefined && { status: status?.trim() || 'active' }),
        updatedById: adminUserId,
      } as Parameters<typeof this.prisma.activity.update>[0]['data'],
    });
    return { mtype: 'success', message: 'OK' };
  }

  /** Set whether a trainer can set their own activity prices (admin toggle). */
  async setTrainerCanSetOwnPrice(adminUserId: string, trainerId: string, canSetOwnPrice: boolean) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const trainer = await this.prisma.user.findUnique({
      where: { id: trainerId },
      select: { role: true },
    });
    if (!trainer) return { mtype: 'error', message: 'Trainer not found' };
    if (trainer.role !== 'trainer') return { mtype: 'error', message: 'User is not a trainer' };
    await this.prisma.user.update({
      where: { id: trainerId },
      data: { trainerCanSetOwnPrice: canSetOwnPrice },
    });
    return { mtype: 'success', message: 'OK' };
  }

  /** List activities for a trainer (admin). Returns activity name, default price, custom price. */
  async trainerActivityList(adminUserId: string, trainerId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const trainer = await this.prisma.user.findUnique({
      where: { id: trainerId },
      select: { trainerCanSetOwnPrice: true },
    });
    if (!trainer) return { mtype: 'error', message: 'Trainer not found' };
    const rows = await this.prisma.trainerActivity.findMany({
      where: { trainerId },
      orderBy: { createdAt: 'asc' },
    });
    const codes = [...new Set(rows.map((r) => r.activityCode))];
    const activities =
      codes.length > 0
        ? await this.prisma.activity.findMany({ where: { code: { in: codes } } })
        : [];
    const byCode = Object.fromEntries(activities.map((a) => [a.code, a]));
    const canSetOwnPrice = trainer.trainerCanSetOwnPrice ?? false;
    const list = rows.map((r) => {
      const a = byCode[r.activityCode];
      const defaultPriceCents = a?.defaultPriceCents ?? null;
      const effectivePriceCents =
        canSetOwnPrice && r.priceCents != null ? r.priceCents : defaultPriceCents;
      return {
        id: r.id,
        trainerId: r.trainerId,
        activityCode: r.activityCode,
        activityName: a?.name ?? r.activityCode,
        defaultPriceCents: defaultPriceCents ?? undefined,
        priceCents: r.priceCents ?? undefined,
        canSetOwnPrice,
        effectivePriceCents: effectivePriceCents ?? undefined,
        createdAt: r.createdAt.toISOString(),
      };
    });
    return { mtype: 'success', message: 'OK', list, canSetOwnPrice };
  }

  /** Add an activity to a trainer with optional custom price (admin). */
  async addTrainerActivity(
    adminUserId: string,
    trainerId: string,
    activityCode: string,
    priceCents?: number | null
  ) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const code = String(activityCode ?? '')
      .trim()
      .toLowerCase();
    if (!code) return { mtype: 'error', message: 'Activity code is required' };
    const [activity, trainer] = await Promise.all([
      this.prisma.activity.findUnique({ where: { code } }),
      this.prisma.user.findUnique({
        where: { id: trainerId },
        select: { role: true },
      }),
    ]);
    if (!activity) return { mtype: 'error', message: 'Activity not found' };
    if (!trainer || trainer.role !== 'trainer')
      return { mtype: 'error', message: 'Trainer not found' };
    const existing = await this.prisma.trainerActivity.findUnique({
      where: { trainerId_activityCode: { trainerId, activityCode: code } },
    });
    if (existing) return { mtype: 'error', message: 'Trainer already has this activity' };
    const data: { trainerId: string; activityCode: string; priceCents?: number | null } = {
      trainerId,
      activityCode: code,
    };
    if (priceCents !== undefined && priceCents !== null) {
      data.priceCents = Math.max(0, Math.round(priceCents));
    }
    const ta = await this.prisma.trainerActivity.create({ data });
    return { mtype: 'success', message: 'OK', id: ta.id };
  }

  /** Set custom price for a trainer's activity (admin). Creates TrainerActivity if missing. */
  async setTrainerActivityPrice(
    adminUserId: string,
    trainerId: string,
    activityCode: string,
    priceCents: number | null
  ) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const code = String(activityCode ?? '')
      .trim()
      .toLowerCase();
    if (!code) return { mtype: 'error', message: 'Activity code is required' };
    const activity = await this.prisma.activity.findUnique({ where: { code } });
    if (!activity) return { mtype: 'error', message: 'Activity not found' };
    const trainer = await this.prisma.user.findUnique({
      where: { id: trainerId },
      select: { role: true },
    });
    if (!trainer || trainer.role !== 'trainer')
      return { mtype: 'error', message: 'Trainer not found' };
    const existing = await this.prisma.trainerActivity.findUnique({
      where: { trainerId_activityCode: { trainerId, activityCode: code } },
    });
    const value = priceCents == null ? null : Math.max(0, Math.round(priceCents));
    if (existing) {
      await this.prisma.trainerActivity.update({
        where: { id: existing.id },
        data: { priceCents: value },
      });
    } else {
      await this.prisma.trainerActivity.create({
        data: { trainerId, activityCode: code, priceCents: value },
      });
    }
    return { mtype: 'success', message: 'OK' };
  }

  async deleteActivity(id: string) {
    const activity = await this.prisma.activity.findUnique({ where: { id } });
    if (!activity) return { mtype: 'error', message: 'Activity not found' };
    await this.prisma.activity.delete({ where: { id } });
    return { mtype: 'success', message: 'OK' };
  }

  /** Update a user's role. Caller must be admin. */
  async updateUserRole(adminUserId: string, targetUserId: string, role: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const allowed = ['admin', 'trainer', 'customer'];
    const roleNorm = role?.trim()?.toLowerCase();
    if (!roleNorm || !allowed.includes(roleNorm))
      return { mtype: 'error', message: 'Invalid role' };
    const target = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) return { mtype: 'error', message: 'User not found' };
    await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: roleNorm },
    });
    return { mtype: 'success', message: 'OK' };
  }

  /** Delete a user (admin only). Cascades to related data. */
  async deleteUser(adminUserId: string, targetUserId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    if (!targetUserId?.trim()) return { mtype: 'error', message: 'User id is required' };
    if (targetUserId === adminUserId) return { mtype: 'error', message: 'Cannot delete yourself' };
    const target = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) return { mtype: 'error', message: 'User not found' };
    await this.prisma.user.delete({ where: { id: targetUserId } });
    return { mtype: 'success', message: 'OK' };
  }

  /** Create a customer (admin only). Email must be unique. */
  async createCustomer(
    adminUserId: string,
    body: { email: string; name?: string; phone?: string }
  ) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const email = (body.email ?? '').trim().toLowerCase();
    if (!email) return { mtype: 'error', message: 'Email is required' };
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) return { mtype: 'error', message: 'Email already in use' };
    const name = (body.name ?? '').trim() || null;
    const phone = (body.phone ?? '').trim() || null;
    if (phone) {
      const existingPhone = await this.prisma.user.findUnique({ where: { phone } });
      if (existingPhone) return { mtype: 'error', message: 'Phone already in use' };
    }
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        phone,
        role: 'customer',
        locale: 'en',
        isActive: true,
      },
      select: userSelect,
    });
    return { mtype: 'success', message: 'OK', ...user };
  }

  /** Update a customer (admin only). Only customers can be updated via this. */
  async updateCustomer(
    adminUserId: string,
    customerId: string,
    body: { name?: string; phone?: string }
  ) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const target = await this.prisma.user.findUnique({
      where: { id: customerId },
      select: { role: true, id: true },
    });
    if (!target || target.role !== 'customer')
      return { mtype: 'error', message: 'Customer not found' };
    const name = body.name !== undefined ? String(body.name).trim() || null : undefined;
    const phone = body.phone !== undefined ? String(body.phone).trim() || null : undefined;
    if (phone !== undefined && phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone, id: { not: customerId } },
      });
      if (existingPhone) return { mtype: 'error', message: 'Phone already in use' };
    }
    const user = await this.prisma.user.update({
      where: { id: customerId },
      data: { ...(name !== undefined && { name }), ...(phone !== undefined && { phone }) },
      select: userSelect,
    });
    return { mtype: 'success', message: 'OK', ...user };
  }

  /** Create a trainer (admin only). Email must be unique. */
  async createTrainer(adminUserId: string, body: { email: string; name?: string; phone?: string }) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const email = (body.email ?? '').trim().toLowerCase();
    if (!email) return { mtype: 'error', message: 'Email is required' };
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) return { mtype: 'error', message: 'Email already in use' };
    const name = (body.name ?? '').trim() || null;
    const phone = (body.phone ?? '').trim() || null;
    if (phone) {
      const existingPhone = await this.prisma.user.findUnique({ where: { phone } });
      if (existingPhone) return { mtype: 'error', message: 'Phone already in use' };
    }
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        phone,
        role: 'trainer',
        locale: 'en',
        isActive: true,
      },
      select: userSelect,
    });
    return { mtype: 'success', message: 'OK', ...user };
  }

  /** Update a trainer (admin only). Only trainers can be updated via this. */
  async updateTrainer(
    adminUserId: string,
    trainerId: string,
    body: { name?: string; phone?: string }
  ) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const target = await this.prisma.user.findUnique({
      where: { id: trainerId },
      select: { role: true, id: true },
    });
    if (!target || target.role !== 'trainer')
      return { mtype: 'error', message: 'Trainer not found' };
    const name = body.name !== undefined ? String(body.name).trim() || null : undefined;
    const phone = body.phone !== undefined ? String(body.phone).trim() || null : undefined;
    if (phone !== undefined && phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone, id: { not: trainerId } },
      });
      if (existingPhone) return { mtype: 'error', message: 'Phone already in use' };
    }
    const user = await this.prisma.user.update({
      where: { id: trainerId },
      data: { ...(name !== undefined && { name }), ...(phone !== undefined && { phone }) },
      select: userSelect,
    });
    return { mtype: 'success', message: 'OK', ...user };
  }

  /** Set customer (or trainer) active/inactive (admin only). */
  async setUserActive(adminUserId: string, targetUserId: string, isActive: boolean) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    if (adminUserId === targetUserId)
      return { mtype: 'error', message: 'Cannot change your own status' };
    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true },
    });
    if (!target) return { mtype: 'error', message: 'User not found' };
    if (target.role === 'admin') return { mtype: 'error', message: 'Cannot deactivate admin' };
    await this.prisma.user.update({
      where: { id: targetUserId },
      data: { isActive },
    });
    return { mtype: 'success', message: 'OK' };
  }

  /** FAQ list from DB (master data). */
  async faqList() {
    const list = await this.prisma.faq.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        question: true,
        answer: true,
        sortOrder: true,
        role: true,
        updatedAt: true,
      },
    });
    return { mtype: 'success', message: 'OK', list, faqList: list };
  }

  async createFaq(question: string, answer: string, sortOrder?: number, role?: string) {
    const q = String(question ?? '').trim();
    const a = String(answer ?? '').trim();
    if (!q) return { mtype: 'error', message: 'Question is required' };
    if (!a) return { mtype: 'error', message: 'Answer is required' };
    const roleVal = role !== undefined && role !== null ? String(role).trim() || null : null;
    const faq = await this.prisma.faq.create({
      data: { question: q, answer: a, sortOrder: sortOrder ?? 0, role: roleVal },
    });
    return { mtype: 'success', message: 'OK', id: faq.id };
  }

  async updateFaq(
    id: string,
    question?: string,
    answer?: string,
    sortOrder?: number,
    role?: string
  ) {
    const existing = await this.prisma.faq.findUnique({ where: { id } });
    if (!existing) return { mtype: 'error', message: 'FAQ not found' };
    const roleVal = role !== undefined ? String(role).trim() || null : undefined;
    await this.prisma.faq.update({
      where: { id },
      data: {
        ...(question !== undefined && { question: String(question).trim() }),
        ...(answer !== undefined && { answer: String(answer).trim() }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        ...(roleVal !== undefined && { role: roleVal }),
      },
    });
    return { mtype: 'success', message: 'OK' };
  }

  async deleteFaq(id: string) {
    const existing = await this.prisma.faq.findUnique({ where: { id } });
    if (!existing) return { mtype: 'error', message: 'FAQ not found' };
    await this.prisma.faq.delete({ where: { id } });
    return { mtype: 'success', message: 'OK' };
  }

  /** Country CRUD (admin only). */
  async countryList() {
    const list = await this.prisma.country.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        isdCode: true,
        updatedById: true,
        updatedAt: true,
        updatedBy: { select: { name: true } },
      },
    });
    return { mtype: 'success', message: 'OK', list };
  }

  async createCountry(adminUserId: string, body: { name: string; isdCode: string }) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const name = String(body?.name ?? '').trim();
    const isdCode = String(body?.isdCode ?? '').trim();
    if (!name) return { mtype: 'error', message: 'Country name is required' };
    if (!isdCode) return { mtype: 'error', message: 'ISD code is required' };
    const created = await this.prisma.country.create({
      data: { name, isdCode, updatedById: adminUserId },
    });
    return { mtype: 'success', message: 'OK', id: created.id };
  }

  async updateCountry(adminUserId: string, id: string, body: { name?: string; isdCode?: string }) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const existing = await this.prisma.country.findUnique({ where: { id } });
    if (!existing) return { mtype: 'error', message: 'Country not found' };
    const name = body.name !== undefined ? String(body.name).trim() : undefined;
    const isdCode = body.isdCode !== undefined ? String(body.isdCode).trim() : undefined;
    if (name !== undefined && !name) return { mtype: 'error', message: 'Country name is required' };
    if (isdCode !== undefined && !isdCode)
      return { mtype: 'error', message: 'ISD code is required' };
    await this.prisma.country.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(isdCode !== undefined && { isdCode }),
        updatedById: adminUserId,
      },
    });
    return { mtype: 'success', message: 'OK' };
  }

  async deleteCountry(adminUserId: string, id: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const existing = await this.prisma.country.findUnique({ where: { id } });
    if (!existing) return { mtype: 'error', message: 'Country not found' };
    await this.prisma.country.delete({ where: { id } });
    return { mtype: 'success', message: 'OK' };
  }

  /** Language CRUD (admin only). */
  async languageList() {
    const list = await this.prisma.language.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        updatedById: true,
        updatedAt: true,
        updatedBy: { select: { name: true } },
      },
    });
    return { mtype: 'success', message: 'OK', list };
  }

  async createLanguage(adminUserId: string, body: { name: string }) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const name = String(body?.name ?? '').trim();
    if (!name) return { mtype: 'error', message: 'Language name is required' };
    const created = await this.prisma.language.create({
      data: { name, updatedById: adminUserId },
    });
    return { mtype: 'success', message: 'OK', id: created.id };
  }

  async updateLanguage(adminUserId: string, id: string, body: { name?: string }) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const existing = await this.prisma.language.findUnique({ where: { id } });
    if (!existing) return { mtype: 'error', message: 'Language not found' };
    const name = body.name !== undefined ? String(body.name).trim() : undefined;
    if (name !== undefined && !name)
      return { mtype: 'error', message: 'Language name is required' };
    await this.prisma.language.update({
      where: { id },
      data: { ...(name !== undefined && { name }), updatedById: adminUserId },
    });
    return { mtype: 'success', message: 'OK' };
  }

  async deleteLanguage(adminUserId: string, id: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const existing = await this.prisma.language.findUnique({ where: { id } });
    if (!existing) return { mtype: 'error', message: 'Language not found' };
    await this.prisma.language.delete({ where: { id } });
    return { mtype: 'success', message: 'OK' };
  }

  /** State CRUD (admin only). */
  async stateList() {
    const list = await this.prisma.state.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        countryId: true,
        updatedById: true,
        updatedAt: true,
        updatedBy: { select: { name: true } },
        country: { select: { name: true } },
      },
    });
    return { mtype: 'success', message: 'OK', list };
  }

  async createState(adminUserId: string, body: { name: string; countryId?: string }) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const name = String(body?.name ?? '').trim();
    if (!name) return { mtype: 'error', message: 'State name is required' };
    const countryId = body.countryId ? String(body.countryId).trim() || null : null;
    const created = await this.prisma.state.create({
      data: { name, countryId, updatedById: adminUserId },
    });
    return { mtype: 'success', message: 'OK', id: created.id };
  }

  async updateState(adminUserId: string, id: string, body: { name?: string; countryId?: string }) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const existing = await this.prisma.state.findUnique({ where: { id } });
    if (!existing) return { mtype: 'error', message: 'State not found' };
    const name = body.name !== undefined ? String(body.name).trim() : undefined;
    if (name !== undefined && !name) return { mtype: 'error', message: 'State name is required' };
    const countryId =
      body.countryId !== undefined ? String(body.countryId).trim() || null : undefined;
    await this.prisma.state.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(countryId !== undefined && { countryId }),
        updatedById: adminUserId,
      },
    });
    return { mtype: 'success', message: 'OK' };
  }

  async deleteState(adminUserId: string, id: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const existing = await this.prisma.state.findUnique({ where: { id } });
    if (!existing) return { mtype: 'error', message: 'State not found' };
    await this.prisma.state.delete({ where: { id } });
    return { mtype: 'success', message: 'OK' };
  }

  /** Contact link CRUD (admin only): list, create, update, delete. */
  async contactLinkList() {
    const list = await this.prisma.contactLink.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        link: true,
        iconUrl: true,
        updatedById: true,
        updatedAt: true,
        updatedBy: { select: { name: true } },
      },
    });
    return { mtype: 'success', message: 'OK', list };
  }

  async createContactLink(
    adminUserId: string,
    body: { name: string; link: string; iconUrl?: string }
  ) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const name = String(body?.name ?? '').trim();
    const link = String(body?.link ?? '').trim();
    if (!name) return { mtype: 'error', message: 'Contact name is required' };
    if (!link) return { mtype: 'error', message: 'Link is required' };
    const iconUrl =
      body.iconUrl !== undefined && body.iconUrl !== null
        ? String(body.iconUrl).trim() || null
        : null;
    const created = await this.prisma.contactLink.create({
      data: { name, link, iconUrl, updatedById: adminUserId },
    });
    return { mtype: 'success', message: 'OK', id: created.id };
  }

  async updateContactLink(
    adminUserId: string,
    id: string,
    body: { name?: string; link?: string; iconUrl?: string }
  ) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const existing = await this.prisma.contactLink.findUnique({ where: { id } });
    if (!existing) return { mtype: 'error', message: 'Contact not found' };
    const name = body.name !== undefined ? String(body.name).trim() : undefined;
    const link = body.link !== undefined ? String(body.link).trim() : undefined;
    const iconUrl = body.iconUrl !== undefined ? String(body.iconUrl).trim() || null : undefined;
    if (name !== undefined && !name) return { mtype: 'error', message: 'Contact name is required' };
    if (link !== undefined && !link) return { mtype: 'error', message: 'Link is required' };
    await this.prisma.contactLink.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(link !== undefined && { link }),
        ...(iconUrl !== undefined && { iconUrl }),
        updatedById: adminUserId,
      },
    });
    return { mtype: 'success', message: 'OK' };
  }

  async deleteContactLink(adminUserId: string, id: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const existing = await this.prisma.contactLink.findUnique({ where: { id } });
    if (!existing) return { mtype: 'error', message: 'Contact not found' };
    await this.prisma.contactLink.delete({ where: { id } });
    return { mtype: 'success', message: 'OK' };
  }

  /** Activity category CRUD (admin only). */
  async activityCategoryList() {
    const list = await this.prisma.activityCategory.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        iconUrl: true,
        updatedById: true,
        updatedAt: true,
        updatedBy: { select: { name: true } },
      },
    });
    return { mtype: 'success', message: 'OK', list };
  }

  async createActivityCategory(adminUserId: string, body: { name: string; iconUrl?: string }) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const name = String(body?.name ?? '').trim();
    if (!name) return { mtype: 'error', message: 'Activity type name is required' };
    const iconUrl =
      body.iconUrl !== undefined && body.iconUrl !== null
        ? String(body.iconUrl).trim() || null
        : null;
    const created = await this.prisma.activityCategory.create({
      data: { name, iconUrl, updatedById: adminUserId },
    });
    return { mtype: 'success', message: 'OK', id: created.id };
  }

  async updateActivityCategory(
    adminUserId: string,
    id: string,
    body: { name?: string; iconUrl?: string }
  ) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const existing = await this.prisma.activityCategory.findUnique({ where: { id } });
    if (!existing) return { mtype: 'error', message: 'Activity category not found' };
    const name = body.name !== undefined ? String(body.name).trim() : undefined;
    const iconUrl = body.iconUrl !== undefined ? String(body.iconUrl).trim() || null : undefined;
    if (name !== undefined && !name)
      return { mtype: 'error', message: 'Activity type name is required' };
    await this.prisma.activityCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(iconUrl !== undefined && { iconUrl }),
        updatedById: adminUserId,
      },
    });
    return { mtype: 'success', message: 'OK' };
  }

  async deleteActivityCategory(adminUserId: string, id: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const existing = await this.prisma.activityCategory.findUnique({ where: { id } });
    if (!existing) return { mtype: 'error', message: 'Activity category not found' };
    await this.prisma.activityCategory.delete({ where: { id } });
    return { mtype: 'success', message: 'OK' };
  }

  /** Contact email: from ContactSetting key "contact_email" or env CONTACT_EMAIL. */
  async contactUs() {
    const row = await this.prisma.contactSetting.findUnique({
      where: { key: 'contact_email' },
    });
    const contactEmail = row?.value ?? process.env.CONTACT_EMAIL ?? 'support@groupfit.example.com';
    return { mtype: 'success', message: 'OK', contactEmail };
  }

  async updateContactUs(contactEmail: string) {
    const value = String(contactEmail ?? '').trim();
    if (!value) return { mtype: 'error', message: 'Contact email is required' };
    await this.prisma.contactSetting.upsert({
      where: { key: 'contact_email' },
      create: { key: 'contact_email', value },
      update: { value },
    });
    return { mtype: 'success', message: 'OK' };
  }

  /** CustomizeDashboard: get/set JSON (widget layout prefs). */
  async getCustomizeDashboard() {
    const row = await this.prisma.contactSetting.findUnique({
      where: { key: 'customize_dashboard' },
    });
    let data: Record<string, unknown> = {};
    if (row?.value) {
      try {
        data = JSON.parse(row.value) as Record<string, unknown>;
      } catch {
        /* ignore */
      }
    }
    return { mtype: 'success', message: 'OK', data };
  }

  async setCustomizeDashboard(data: Record<string, unknown>) {
    const value = JSON.stringify(data ?? {});
    await this.prisma.contactSetting.upsert({
      where: { key: 'customize_dashboard' },
      create: { key: 'customize_dashboard', value },
      update: { value },
    });
    return { mtype: 'success', message: 'OK' };
  }
}
