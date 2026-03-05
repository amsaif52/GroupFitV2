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
    const [userCount, trainerCount, customerCount, sessionCount, earningResult] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'trainer' } }),
      this.prisma.user.count({ where: { role: 'customer' } }),
      this.prisma.session.count(),
      this.prisma.session.aggregate({
        where: { status: 'completed' },
        _sum: { amountCents: true },
      }),
    ]);
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
    validTo?: string | null,
  ) {
    const codeNorm = String(code ?? '').trim();
    if (!codeNorm) return { mtype: 'error', message: 'Code is required' };
    const typeNorm = String(type ?? '').toLowerCase();
    if (typeNorm !== 'percent' && typeNorm !== 'fixed') return { mtype: 'error', message: 'Type must be percent or fixed' };
    const numValue = Number(value);
    if (Number.isNaN(numValue) || numValue < 0) return { mtype: 'error', message: 'Value must be a non-negative number' };
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
    validTo?: string | null,
  ) {
    const discount = await this.prisma.discount.findUnique({ where: { id } });
    if (!discount) return { mtype: 'error', message: 'Discount not found' };
    const codeNorm = code !== undefined ? String(code).trim() : discount.code;
    if (codeNorm && codeNorm !== discount.code) {
      const existing = await this.prisma.discount.findUnique({ where: { code: codeNorm } });
      if (existing) return { mtype: 'error', message: 'Discount code already in use' };
    }
    const typeNorm = type !== undefined ? String(type).toLowerCase() : discount.type;
    if (typeNorm !== 'percent' && typeNorm !== 'fixed') return { mtype: 'error', message: 'Type must be percent or fixed' };
    const numValue = value !== undefined ? Number(value) : Number(discount.value);
    if (Number.isNaN(numValue) || numValue < 0) return { mtype: 'error', message: 'Value must be a non-negative number' };
    const validFromDate = validFrom !== undefined ? (validFrom ? new Date(validFrom) : null) : undefined;
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
    const list = await this.prisma.activity.findMany({
      orderBy: { code: 'asc' },
    });
    return {
      mtype: 'success',
      message: 'OK',
      list: list.map((a: { id: string; code: string; name: string; description: string | null; createdAt: Date; updatedAt: Date }) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        description: a.description ?? '',
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
    };
  }

  async createActivity(code: string, name: string, description?: string) {
    const codeNorm = String(code ?? '').trim().toLowerCase();
    if (!codeNorm || !name?.trim()) return { mtype: 'error', message: 'code and name required' };
    const existing = await this.prisma.activity.findUnique({ where: { code: codeNorm } });
    if (existing) return { mtype: 'error', message: 'Activity code already exists' };
    const activity = await this.prisma.activity.create({
      data: { code: codeNorm, name: name.trim(), description: description?.trim() || null },
    });
    return { mtype: 'success', message: 'OK', id: activity.id };
  }

  async updateActivity(id: string, code?: string, name?: string, description?: string) {
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
      },
    });
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
    const admin = await this.prisma.user.findUnique({ where: { id: adminUserId }, select: { role: true } });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    const allowed = ['admin', 'trainer', 'customer'];
    const roleNorm = role?.trim()?.toLowerCase();
    if (!roleNorm || !allowed.includes(roleNorm)) return { mtype: 'error', message: 'Invalid role' };
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
    const admin = await this.prisma.user.findUnique({ where: { id: adminUserId }, select: { role: true } });
    if (!admin || admin.role !== 'admin') return { mtype: 'error', message: 'Forbidden' };
    if (!targetUserId?.trim()) return { mtype: 'error', message: 'User id is required' };
    if (targetUserId === adminUserId) return { mtype: 'error', message: 'Cannot delete yourself' };
    const target = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) return { mtype: 'error', message: 'User not found' };
    await this.prisma.user.delete({ where: { id: targetUserId } });
    return { mtype: 'success', message: 'OK' };
  }

  /** FAQ list from DB (master data). */
  async faqList() {
    const list = await this.prisma.faq.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, question: true, answer: true, sortOrder: true },
    });
    return { mtype: 'success', message: 'OK', list, faqList: list };
  }

  async createFaq(question: string, answer: string, sortOrder?: number) {
    const q = String(question ?? '').trim();
    const a = String(answer ?? '').trim();
    if (!q) return { mtype: 'error', message: 'Question is required' };
    if (!a) return { mtype: 'error', message: 'Answer is required' };
    const faq = await this.prisma.faq.create({
      data: { question: q, answer: a, sortOrder: sortOrder ?? 0 },
    });
    return { mtype: 'success', message: 'OK', id: faq.id };
  }

  async updateFaq(id: string, question?: string, answer?: string, sortOrder?: number) {
    const existing = await this.prisma.faq.findUnique({ where: { id } });
    if (!existing) return { mtype: 'error', message: 'FAQ not found' };
    await this.prisma.faq.update({
      where: { id },
      data: {
        ...(question !== undefined && { question: String(question).trim() }),
        ...(answer !== undefined && { answer: String(answer).trim() }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
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

  /** Contact email: from ContactSetting key "contact_email" or env CONTACT_EMAIL. */
  async contactUs() {
    const row = await this.prisma.contactSetting.findUnique({
      where: { key: 'contact_email' },
    });
    const contactEmail =
      row?.value ?? process.env.CONTACT_EMAIL ?? 'support@groupfit.example.com';
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
