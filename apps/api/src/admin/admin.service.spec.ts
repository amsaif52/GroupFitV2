import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminService', () => {
  let service: AdminService;

  const mockUser = {
    id: 'user-1',
    email: 'admin@test.com',
    name: 'Admin',
    role: 'admin',
    locale: 'en',
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession = {
    id: 'session-1',
    customerId: 'cust-1',
    trainerId: 'trainer-1',
    activityName: 'Yoga',
    scheduledAt: new Date(),
    status: 'scheduled',
    amountCents: 5000,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: { id: 'cust-1', email: 'c@test.com', name: 'Customer' },
    trainer: { id: 'trainer-1', email: 't@test.com', name: 'Trainer' },
  };

  const mockSupportTicket = {
    id: 'ticket-1',
    userId: 'user-1',
    subject: 'Help',
    message: 'Need help',
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { id: 'user-1', email: 'u@test.com', name: 'User', role: 'customer' },
  };

  const mockDiscount = {
    id: 'disc-1',
    code: 'SAVE10',
    type: 'percent',
    value: 10,
    validFrom: null,
    validTo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    session: {
      count: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    supportTicket: {
      findMany: jest.fn(),
    },
    discount: {
      findMany: jest.fn(),
    },
    faq: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    contactSetting: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('returns division admin and status ok', () => {
      const result = service.getHealth();
      expect(result.division).toBe('admin');
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('dashboard', () => {
    it('returns counts and earningTotal from Prisma', async () => {
      mockPrisma.user.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(6);
      mockPrisma.session.count.mockResolvedValue(5);
      mockPrisma.session.aggregate.mockResolvedValue({
        _sum: { amountCents: 25000 },
      });
      const result = await service.dashboard();
      expect(result.mtype).toBe('success');
      expect(result.data).toBeDefined();
      expect(result.data.userCount).toBe(10);
      expect(result.data.trainerCount).toBe(3);
      expect(result.data.customerCount).toBe(6);
      expect(result.data.sessionCount).toBe(5);
      expect(result.data.earningTotal).toBe(25000);
    });

    it('returns zero earningTotal when no completed sessions', async () => {
      mockPrisma.user.count.mockResolvedValue(0);
      mockPrisma.session.count.mockResolvedValue(0);
      mockPrisma.session.aggregate.mockResolvedValue({ _sum: { amountCents: null } });
      const result = await service.dashboard();
      expect(result.data.earningTotal).toBe(0);
    });
  });

  describe('usersList', () => {
    it('returns list of users with safe fields', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockUser]);
      const result = await service.usersList();
      expect(result.mtype).toBe('success');
      expect(result.list).toHaveLength(1);
      expect((result.list as (typeof mockUser)[])[0].email).toBe('admin@test.com');
      expect((result.list as (typeof mockUser)[])[0].name).toBe('Admin');
    });
  });

  describe('trainerList', () => {
    it('returns list filtered by role trainer', async () => {
      mockPrisma.user.findMany.mockResolvedValue([{ ...mockUser, role: 'trainer' }]);
      const result = await service.trainerList();
      expect(result.list).toHaveLength(1);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { role: 'trainer' } })
      );
    });
  });

  describe('customerList', () => {
    it('returns list filtered by role customer', async () => {
      mockPrisma.user.findMany.mockResolvedValue([{ ...mockUser, role: 'customer' }]);
      const result = await service.customerList();
      expect(result.list).toHaveLength(1);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { role: 'customer' } })
      );
    });
  });

  describe('sessionList', () => {
    it('returns list with customer and trainer names', async () => {
      mockPrisma.session.findMany.mockResolvedValue([mockSession]);
      const result = await service.sessionList();
      expect(result.mtype).toBe('success');
      expect(result.list).toHaveLength(1);
      const row = (result.list as Record<string, unknown>[])[0];
      expect(row.customerName).toBe('Customer');
      expect(row.trainerName).toBe('Trainer');
      expect(row.activityName).toBe('Yoga');
      expect(row.scheduledAt).toBeDefined();
    });
  });

  describe('supportList', () => {
    it('returns list with user email and role', async () => {
      mockPrisma.supportTicket.findMany.mockResolvedValue([mockSupportTicket]);
      const result = await service.supportList();
      expect(result.list).toHaveLength(1);
      const row = (result.list as Record<string, unknown>[])[0];
      expect(row.subject).toBe('Help');
      expect(row.userEmail).toBe('u@test.com');
      expect(row.userRole).toBe('customer');
    });
  });

  describe('discountList', () => {
    it('returns list with code, type, value and serialized dates', async () => {
      mockPrisma.discount.findMany.mockResolvedValue([mockDiscount]);
      const result = await service.discountList();
      expect(result.list).toHaveLength(1);
      const row = (result.list as Record<string, unknown>[])[0];
      expect(row.code).toBe('SAVE10');
      expect(row.type).toBe('percent');
      expect(row.value).toBe(10);
    });
  });

  describe('earningReport', () => {
    it('returns sessionCount, completedSessionCount and earningTotalFormatted', async () => {
      mockPrisma.session.count.mockResolvedValue(10);
      mockPrisma.session.aggregate.mockResolvedValue({
        _sum: { amountCents: 10000 },
        _count: 8,
      });
      const result = await service.earningReport();
      expect(result.data.sessionCount).toBe(10);
      expect(result.data.completedSessionCount).toBe(8);
      expect(result.data.earningTotalCents).toBe(10000);
      expect(result.data.earningTotalFormatted).toBe('$100.00');
    });
  });

  describe('deleteUser', () => {
    it('returns Forbidden when caller is not admin', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'customer' });
      const result = await service.deleteUser('user-1', 'other-user');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Forbidden');
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });

    it('returns error when target user not found', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: 'admin-1', role: 'admin' })
        .mockResolvedValueOnce(null);
      const result = await service.deleteUser('admin-1', 'missing-user');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('User not found');
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });

    it('returns error when admin tries to delete self', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'admin-1', role: 'admin' });
      const result = await service.deleteUser('admin-1', 'admin-1');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Cannot delete yourself');
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });

    it('deletes user when caller is admin and target exists', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: 'admin-1', role: 'admin' })
        .mockResolvedValueOnce({ id: 'target-1', role: 'customer' });
      mockPrisma.user.delete.mockResolvedValue(undefined);
      const result = await service.deleteUser('admin-1', 'target-1');
      expect(result.mtype).toBe('success');
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'target-1' } });
    });
  });

  describe('faqList', () => {
    it('returns success with faqList and list from DB', async () => {
      const faqRows = [
        { id: 'faq-1', question: 'Q1', answer: 'A1', sortOrder: 0 },
        { id: 'faq-2', question: 'Q2', answer: 'A2', sortOrder: 1 },
      ];
      mockPrisma.faq.findMany.mockResolvedValue(faqRows);
      const result = await service.faqList();
      expect(result.mtype).toBe('success');
      expect(result.list).toHaveLength(2);
      expect(result.faqList).toHaveLength(2);
      expect(mockPrisma.faq.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { sortOrder: 'asc' } })
      );
    });
  });

  describe('contactUs', () => {
    it('returns contactEmail from DB when set', async () => {
      mockPrisma.contactSetting.findUnique.mockResolvedValue({
        key: 'contact_email',
        value: 'admin@example.com',
      });
      const result = await service.contactUs();
      expect(result.mtype).toBe('success');
      expect(result.contactEmail).toBe('admin@example.com');
    });

    it('returns fallback contactEmail when DB has no row', async () => {
      mockPrisma.contactSetting.findUnique.mockResolvedValue(null);
      const result = await service.contactUs();
      expect(result.mtype).toBe('success');
      expect(typeof result.contactEmail).toBe('string');
      expect(result.contactEmail.length).toBeGreaterThan(0);
    });
  });

  describe('createFaq', () => {
    it('returns error when question empty', async () => {
      const result = await service.createFaq('', 'Answer', 0);
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Question is required');
      expect(mockPrisma.faq.create).not.toHaveBeenCalled();
    });

    it('returns error when answer empty', async () => {
      const result = await service.createFaq('Question', '', 0);
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Answer is required');
      expect(mockPrisma.faq.create).not.toHaveBeenCalled();
    });

    it('creates FAQ and returns id', async () => {
      mockPrisma.faq.create.mockResolvedValue({ id: 'new-faq-1' });
      const result = await service.createFaq('Q', 'A', 1);
      expect(result.mtype).toBe('success');
      expect(result.id).toBe('new-faq-1');
      expect(mockPrisma.faq.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: { question: 'Q', answer: 'A', sortOrder: 1 } })
      );
    });
  });

  describe('updateFaq', () => {
    it('returns error when FAQ not found', async () => {
      mockPrisma.faq.findUnique.mockResolvedValue(null);
      const result = await service.updateFaq('missing', 'Q', 'A');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('FAQ not found');
      expect(mockPrisma.faq.update).not.toHaveBeenCalled();
    });

    it('updates FAQ when found', async () => {
      mockPrisma.faq.findUnique.mockResolvedValue({
        id: 'faq-1',
        question: 'Q',
        answer: 'A',
        sortOrder: 0,
      });
      mockPrisma.faq.update.mockResolvedValue(undefined);
      const result = await service.updateFaq('faq-1', 'Q2', 'A2');
      expect(result.mtype).toBe('success');
      expect(mockPrisma.faq.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'faq-1' }, data: { question: 'Q2', answer: 'A2' } })
      );
    });
  });

  describe('deleteFaq', () => {
    it('returns error when FAQ not found', async () => {
      mockPrisma.faq.findUnique.mockResolvedValue(null);
      const result = await service.deleteFaq('missing');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('FAQ not found');
      expect(mockPrisma.faq.delete).not.toHaveBeenCalled();
    });

    it('deletes FAQ when found', async () => {
      mockPrisma.faq.findUnique.mockResolvedValue({ id: 'faq-1' });
      mockPrisma.faq.delete.mockResolvedValue(undefined);
      const result = await service.deleteFaq('faq-1');
      expect(result.mtype).toBe('success');
      expect(mockPrisma.faq.delete).toHaveBeenCalledWith({ where: { id: 'faq-1' } });
    });
  });

  describe('updateContactUs', () => {
    it('returns error when contactEmail empty', async () => {
      const result = await service.updateContactUs('');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Contact email is required');
      expect(mockPrisma.contactSetting.upsert).not.toHaveBeenCalled();
    });

    it('upserts contact_email', async () => {
      mockPrisma.contactSetting.upsert.mockResolvedValue(undefined);
      const result = await service.updateContactUs('support@groupfit.com');
      expect(result.mtype).toBe('success');
      expect(mockPrisma.contactSetting.upsert).toHaveBeenCalledWith({
        where: { key: 'contact_email' },
        create: { key: 'contact_email', value: 'support@groupfit.com' },
        update: { value: 'support@groupfit.com' },
      });
    });
  });

  describe('getCustomizeDashboard', () => {
    it('returns empty data when no row', async () => {
      mockPrisma.contactSetting.findUnique.mockResolvedValue(null);
      const result = await service.getCustomizeDashboard();
      expect(result.mtype).toBe('success');
      expect(result.data).toEqual({});
    });

    it('returns parsed JSON when row exists', async () => {
      mockPrisma.contactSetting.findUnique.mockResolvedValue({
        key: 'customize_dashboard',
        value: '{"widgets":["a","b"]}',
      });
      const result = await service.getCustomizeDashboard();
      expect(result.mtype).toBe('success');
      expect(result.data).toEqual({ widgets: ['a', 'b'] });
    });
  });

  describe('setCustomizeDashboard', () => {
    it('upserts customize_dashboard JSON', async () => {
      mockPrisma.contactSetting.upsert.mockResolvedValue(undefined);
      const data = { layout: 'grid' };
      const result = await service.setCustomizeDashboard(data);
      expect(result.mtype).toBe('success');
      expect(mockPrisma.contactSetting.upsert).toHaveBeenCalledWith({
        where: { key: 'customize_dashboard' },
        create: { key: 'customize_dashboard', value: '{"layout":"grid"}' },
        update: { value: '{"layout":"grid"}' },
      });
    });
  });
});
