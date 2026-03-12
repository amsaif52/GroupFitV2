import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CustomerService', () => {
  let service: CustomerService;

  const mockUser = {
    id: 'trainer-1',
    email: 'trainer@test.com',
    name: 'Trainer One',
    phone: '+1234567890',
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
    trainer: { id: 'trainer-1', name: 'Trainer One', email: 'trainer@test.com' },
  };

  const mockPrisma = {
    user: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    session: { findMany: jest.fn(), findFirst: jest.fn() },
    group: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    groupMember: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    referral: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    review: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    activity: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    discount: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    supportTicket: { create: jest.fn() },
    faq: { findMany: jest.fn() },
    contactSetting: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteProfile', () => {
    it('returns success message for account deletion request', () => {
      const result = service.deleteProfile();
      expect(result.mtype).toBe('success');
      expect(result.message).toContain('deletion');
    });
  });

  describe('customerSessionList', () => {
    it('returns upcoming sessions for the customer', async () => {
      mockPrisma.session.findMany.mockResolvedValue([mockSession]);
      const result = await service.customerSessionList('cust-1');
      expect(result.mtype).toBe('success');
      expect(result.customerSessionList).toHaveLength(1);
      expect((result.customerSessionList as Record<string, unknown>[])[0].sessionName).toBe('Yoga');
      expect((result.customerSessionList as Record<string, unknown>[])[0].trainerName).toBe(
        'Trainer One'
      );
      expect(mockPrisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { customerId: 'cust-1', status: { in: ['scheduled'] } },
        })
      );
    });
  });

  describe('customerSessionCompletedList', () => {
    it('returns completed sessions for the customer', async () => {
      mockPrisma.session.findMany.mockResolvedValue([{ ...mockSession, status: 'completed' }]);
      const result = await service.customerSessionCompletedList('cust-1');
      expect(result.customerSessionCompletedList).toHaveLength(1);
      expect(mockPrisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { customerId: 'cust-1', status: 'completed' },
        })
      );
    });
  });

  describe('todaysessionlist', () => {
    it('returns sessions scheduled for today for the customer', async () => {
      mockPrisma.session.findMany.mockResolvedValue([mockSession]);
      const result = await service.todaysessionlist('cust-1');
      expect(result.todaysessionlist).toHaveLength(1);
      expect(mockPrisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customerId: 'cust-1',
            status: 'scheduled',
          }),
        })
      );
    });
  });

  describe('fetchSessionDetails', () => {
    it('returns session when customer owns it', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({
        ...mockSession,
        trainer: { id: 'trainer-1', name: 'Trainer One', email: 't@test.com', phone: null },
      });
      const result = await service.fetchSessionDetails('cust-1', 'session-1');
      expect(result.mtype).toBe('success');
      expect(result.sessionId).toBe('session-1');
      expect(result.trainerName).toBeDefined();
      expect(mockPrisma.session.findFirst).toHaveBeenCalledWith({
        where: { id: 'session-1', customerId: 'cust-1' },
        include: expect.any(Object),
      });
    });

    it('returns error when session not found', async () => {
      mockPrisma.session.findFirst.mockResolvedValue(null);
      const result = await service.fetchSessionDetails('cust-1', 'bad-id');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Session not found');
    });
  });

  describe('ViewSession', () => {
    it('returns same as fetchSessionDetails when customer owns session', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({
        ...mockSession,
        trainer: { id: 'trainer-1', name: 'Trainer One', email: 't@test.com', phone: null },
      });
      const result = await service.ViewSession('cust-1', 'session-1');
      expect(result.mtype).toBe('success');
      expect(result.sessionId).toBe('session-1');
      expect(mockPrisma.session.findFirst).toHaveBeenCalledWith({
        where: { id: 'session-1', customerId: 'cust-1' },
        include: expect.any(Object),
      });
    });
  });

  describe('viewTrainer', () => {
    it('returns trainer when found by id and role trainer', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      const result = await service.viewTrainer('trainer-1');
      expect(result.mtype).toBe('success');
      expect(result.trainerName).toBe('Trainer One');
      expect(result.email).toBe('trainer@test.com');
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'trainer-1', role: 'trainer' },
      });
    });

    it('returns error when trainer not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      const result = await service.viewTrainer('unknown');
      expect(result.mtype).toBe('error');
    });
  });

  describe('topratedTrainersList', () => {
    it('returns list of users with role trainer', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockUser]);
      const result = await service.topratedTrainersList();
      expect(result.topratedTrainersList).toHaveLength(1);
      expect((result.topratedTrainersList as Record<string, unknown>[])[0].trainerName).toBe(
        'Trainer One'
      );
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { role: 'trainer' } })
      );
    });
  });

  describe('fetchAllActivity', () => {
    it('returns activityList from reference data', async () => {
      mockPrisma.activity.findMany.mockResolvedValue([
        { id: 'a1', code: 'yoga', name: 'Yoga', description: null },
      ]);
      const result = await service.fetchAllActivity();
      expect(result.mtype).toBe('success');
      expect(result.activityList).toBeDefined();
      expect(Array.isArray(result.activityList)).toBe(true);
      expect((result.activityList as unknown[]).length).toBeGreaterThan(0);
    });
  });

  describe('viewActivity', () => {
    it('returns activity by id from db when found', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue({
        id: 'a1',
        code: 'yoga',
        name: 'Yoga',
        description: null,
      });
      const result = await service.viewActivity('a1');
      expect(result.mtype).toBe('success');
      expect(result.activityName).toBeDefined();
    });

    it('returns activity from list when id not in db', async () => {
      mockPrisma.activity.findUnique.mockResolvedValue(null);
      mockPrisma.activity.findMany.mockResolvedValue([
        { id: 'a1', code: 'yoga', name: 'Yoga', description: null },
      ]);
      const result = await service.viewActivity('0');
      expect(result.mtype).toBe('success');
      expect((result as Record<string, unknown>).activityName).toBeDefined();
    });
  });

  describe('fetchallgroupslist', () => {
    it('returns list of groups owned by customer', async () => {
      const groups = [
        {
          id: 'g1',
          name: 'Morning Crew',
          ownerId: 'cust-1',
          createdAt: new Date(),
          _count: { members: 2 },
        },
      ];
      mockPrisma.group.findMany.mockResolvedValue(groups);
      mockPrisma.groupMember.findMany.mockResolvedValue([]);
      const result = await service.fetchallgroupslist('cust-1');
      expect(result.mtype).toBe('success');
      expect(result.fetchallgroupslist).toHaveLength(1);
      expect((result.fetchallgroupslist as Record<string, unknown>[])[0].name).toBe('Morning Crew');
      expect((result.fetchallgroupslist as Record<string, unknown>[])[0].memberCount).toBe(2);
      expect(mockPrisma.group.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { ownerId: 'cust-1' } })
      );
    });
  });

  describe('addgroupname', () => {
    it('returns error when name empty', async () => {
      const result = await service.addgroupname('cust-1', '');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Group name is required');
    });

    it('creates group and returns id', async () => {
      mockPrisma.group.create.mockResolvedValue({ id: 'new-group' });
      const result = await service.addgroupname('cust-1', 'My Group');
      expect(result.mtype).toBe('success');
      expect(result.id).toBe('new-group');
      expect(mockPrisma.group.create).toHaveBeenCalledWith({
        data: { ownerId: 'cust-1', name: 'My Group' },
      });
    });
  });

  describe('addgroupmember', () => {
    it('returns error when group not found', async () => {
      mockPrisma.group.findFirst.mockResolvedValue(null);
      const result = await service.addgroupmember('cust-1', 'bad-group', 'user-2');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Group not found');
    });

    it('returns error when member user not found', async () => {
      mockPrisma.group.findFirst.mockResolvedValue({ id: 'g1', ownerId: 'cust-1' });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.addgroupmember('cust-1', 'g1', 'unknown-user');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('User not found');
    });

    it('GroupInvite delegates to addgroupmember and creates member', async () => {
      mockPrisma.group.findFirst.mockResolvedValue({ id: 'g1', ownerId: 'cust-1' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-2' });
      mockPrisma.groupMember.create.mockResolvedValue({ id: 'gm-1' });
      const result = await service.GroupInvite('cust-1', 'g1', 'user-2');
      expect(result.mtype).toBe('success');
      expect(result.id).toBe('gm-1');
      expect(mockPrisma.groupMember.create).toHaveBeenCalled();
    });

    it('creates group member and returns id', async () => {
      mockPrisma.group.findFirst.mockResolvedValue({ id: 'g1', ownerId: 'cust-1' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-2' });
      mockPrisma.groupMember.create.mockResolvedValue({ id: 'gm-1' });
      const result = await service.addgroupmember('cust-1', 'g1', 'user-2');
      expect(result.mtype).toBe('success');
      expect(result.id).toBe('gm-1');
      expect(mockPrisma.groupMember.create).toHaveBeenCalledWith({
        data: { groupId: 'g1', userId: 'user-2' },
      });
    });
  });

  describe('fetchgroupMembers', () => {
    it('returns error when group not found', async () => {
      mockPrisma.group.findFirst.mockResolvedValue(null);
      const result = await service.fetchgroupMembers('cust-1', 'bad-group');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Group not found');
    });

    it('returns list of members with user details', async () => {
      mockPrisma.group.findFirst.mockResolvedValue({
        id: 'g1',
        ownerId: 'cust-1',
        members: [
          {
            id: 'gm-1',
            userId: 'user-2',
            createdAt: new Date(),
            user: { id: 'user-2', name: 'Jane', email: 'j@test.com' },
          },
        ],
      });
      const result = await service.fetchgroupMembers('cust-1', 'g1');
      expect(result.mtype).toBe('success');
      expect(result.fetchgroupMembers).toHaveLength(1);
      expect((result.fetchgroupMembers as Record<string, unknown>[])[0].userName).toBe('Jane');
      expect((result.fetchgroupMembers as Record<string, unknown>[])[0].userEmail).toBe(
        'j@test.com'
      );
    });
  });

  describe('updategroupmember', () => {
    it('returns error when group not found', async () => {
      mockPrisma.group.findFirst.mockResolvedValue(null);
      const result = await service.updategroupmember('cust-1', 'bad-group', 'gm-1');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Group not found');
    });

    it('returns error when member not found', async () => {
      mockPrisma.group.findFirst.mockResolvedValue({ id: 'g1', ownerId: 'cust-1' });
      mockPrisma.groupMember.findFirst.mockResolvedValue(null);
      const result = await service.updategroupmember('cust-1', 'g1', 'bad-member');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Member not found');
    });

    it('deletes member when owner removes member', async () => {
      mockPrisma.group.findFirst.mockResolvedValue({ id: 'g1', ownerId: 'cust-1' });
      mockPrisma.groupMember.findFirst.mockResolvedValue({
        id: 'gm-1',
        groupId: 'g1',
        userId: 'user-2',
      });
      mockPrisma.groupMember.delete.mockResolvedValue(undefined);
      const result = await service.updategroupmember('cust-1', 'g1', 'gm-1');
      expect(result.mtype).toBe('success');
      expect(mockPrisma.groupMember.delete).toHaveBeenCalledWith({ where: { id: 'gm-1' } });
    });

    it('deletes member when member removes self', async () => {
      mockPrisma.group.findFirst.mockResolvedValue({ id: 'g1', ownerId: 'owner-1' });
      mockPrisma.groupMember.findFirst.mockResolvedValue({
        id: 'gm-1',
        groupId: 'g1',
        userId: 'cust-1',
      });
      mockPrisma.groupMember.delete.mockResolvedValue(undefined);
      const result = await service.updategroupmember('cust-1', 'g1', 'gm-1');
      expect(result.mtype).toBe('success');
      expect(mockPrisma.groupMember.delete).toHaveBeenCalledWith({ where: { id: 'gm-1' } });
    });

    it('returns error when non-owner tries to remove another member', async () => {
      mockPrisma.group.findFirst.mockResolvedValue({ id: 'g1', ownerId: 'owner-1' });
      mockPrisma.groupMember.findFirst.mockResolvedValue({
        id: 'gm-1',
        groupId: 'g1',
        userId: 'user-2',
      });
      const result = await service.updategroupmember('cust-1', 'g1', 'gm-1');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Only the group owner can remove other members');
      expect(mockPrisma.groupMember.delete).not.toHaveBeenCalled();
    });
  });

  describe('deletegrouplist', () => {
    it('returns error when group not found', async () => {
      mockPrisma.group.findFirst.mockResolvedValue(null);
      const result = await service.deletegrouplist('cust-1', 'bad-group');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Group not found');
    });

    it('deletes group and returns success', async () => {
      mockPrisma.group.findFirst.mockResolvedValue({ id: 'g1', ownerId: 'cust-1' });
      mockPrisma.group.delete.mockResolvedValue(undefined);
      const result = await service.deletegrouplist('cust-1', 'g1');
      expect(result.mtype).toBe('success');
      expect(mockPrisma.group.delete).toHaveBeenCalledWith({ where: { id: 'g1' } });
    });
  });

  describe('ReferralList', () => {
    it('returns list of referrals for current user as referrer', async () => {
      const referrals = [
        {
          id: 'ref-1',
          referredUserId: 'u2',
          createdAt: new Date(),
          referredUser: {
            id: 'u2',
            email: 'referred@test.com',
            name: 'Referred User',
            createdAt: new Date(),
          },
        },
      ];
      mockPrisma.referral.findMany.mockResolvedValue(referrals);
      const result = await service.ReferralList('cust-1');
      expect(result.mtype).toBe('success');
      expect(result.ReferralList).toHaveLength(1);
      expect((result.ReferralList as Record<string, unknown>[])[0].referredUserEmail).toBe(
        'referred@test.com'
      );
      expect((result.ReferralList as Record<string, unknown>[])[0].referredUserName).toBe(
        'Referred User'
      );
      expect(mockPrisma.referral.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { referrerId: 'cust-1' } })
      );
    });
  });

  describe('referraldetails', () => {
    it('returns error when referralId empty', async () => {
      const result = await service.referraldetails('cust-1', '');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('referralId is required');
    });

    it('returns error when referral not found', async () => {
      mockPrisma.referral.findFirst.mockResolvedValue(null);
      const result = await service.referraldetails('cust-1', 'bad-id');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Referral not found');
    });

    it('returns referral detail when found', async () => {
      mockPrisma.referral.findFirst.mockResolvedValue({
        id: 'ref-1',
        referredUserId: 'u2',
        createdAt: new Date(),
        referredUser: {
          id: 'u2',
          email: 'referred@test.com',
          name: 'Referred',
          phone: null,
          createdAt: new Date(),
        },
      });
      const result = await service.referraldetails('cust-1', 'ref-1');
      expect(result.mtype).toBe('success');
      expect(result.referredUserEmail).toBe('referred@test.com');
      expect(result.referredUserName).toBe('Referred');
    });
  });

  describe('getTrainerAvgRating', () => {
    it('returns 0 rating when trainerId empty', async () => {
      const result = await service.getTrainerAvgRating('');
      expect(result.mtype).toBe('success');
      expect(result.rating).toBe(0);
      expect(result.reviewCount).toBe(0);
      expect(mockPrisma.review.aggregate).not.toHaveBeenCalled();
    });

    it('returns aggregated rating and count', async () => {
      mockPrisma.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: 7,
      });
      const result = await service.getTrainerAvgRating('trainer-1');
      expect(result.mtype).toBe('success');
      expect(result.rating).toBe(4.5);
      expect(result.reviewCount).toBe(7);
    });
  });

  describe('fetchTrainerRelatedReviews', () => {
    it('returns empty list when trainerId empty', async () => {
      const result = await service.fetchTrainerRelatedReviews('');
      expect(result.mtype).toBe('success');
      expect(result.fetchTrainerRelatedReviews).toEqual([]);
      expect(mockPrisma.review.findMany).not.toHaveBeenCalled();
    });

    it('returns list of reviews for trainer', async () => {
      const reviews = [
        {
          id: 'r1',
          trainerId: 'trainer-1',
          customerId: 'c1',
          sessionId: null,
          rating: 5,
          comment: 'Great',
          createdAt: new Date(),
          customer: { id: 'c1', name: 'Customer', email: 'c@test.com' },
        },
      ];
      mockPrisma.review.findMany.mockResolvedValue(reviews);
      const result = await service.fetchTrainerRelatedReviews('trainer-1');
      expect(result.mtype).toBe('success');
      expect(result.fetchTrainerRelatedReviews).toHaveLength(1);
      expect((result.fetchTrainerRelatedReviews as Record<string, unknown>[])[0].rating).toBe(5);
      expect((result.fetchTrainerRelatedReviews as Record<string, unknown>[])[0].customerName).toBe(
        'Customer'
      );
    });
  });

  describe('reviewlist', () => {
    it('returns reviewlist key and list when trainerId provided', async () => {
      const reviews = [
        {
          id: 'r1',
          trainerId: 'trainer-1',
          customerId: 'c1',
          sessionId: null,
          rating: 5,
          comment: 'Great',
          createdAt: new Date(),
          customer: { id: 'c1', name: 'Customer', email: 'c@test.com' },
        },
      ];
      mockPrisma.review.findMany.mockResolvedValue(reviews);
      const result = await service.reviewlist('trainer-1');
      expect(result.mtype).toBe('success');
      expect(result.reviewlist).toHaveLength(1);
      expect(result.list).toHaveLength(1);
    });

    it('returns empty reviewlist when trainerId empty', async () => {
      const result = await service.reviewlist('');
      expect(result.mtype).toBe('success');
      expect(result.reviewlist).toEqual([]);
    });
  });

  describe('customerActivityList', () => {
    it('returns activity list from DB', async () => {
      mockPrisma.activity.findMany.mockResolvedValue([
        { id: 'a1', code: 'yoga', name: 'Yoga', description: null },
      ]);
      const result = await service.customerActivityList();
      expect(result.mtype).toBe('success');
      expect(result.customerActivityList).toHaveLength(1);
      expect((result.customerActivityList as Record<string, unknown>[])[0].code).toBe('yoga');
    });
  });

  describe('avialableDiscountList', () => {
    it('returns discounts valid now', async () => {
      mockPrisma.discount.findMany.mockResolvedValue([
        {
          id: 'd1',
          code: 'SAVE10',
          type: 'percent',
          value: 10,
          validFrom: null,
          validTo: null,
        },
      ]);
      const result = await service.avialableDiscountList();
      expect(result.mtype).toBe('success');
      expect(result.avialableDiscountList).toHaveLength(1);
      expect((result.avialableDiscountList as Record<string, unknown>[])[0].code).toBe('SAVE10');
      expect((result.avialableDiscountList as Record<string, unknown>[])[0].value).toBe(10);
    });
  });

  describe('checkDiscount', () => {
    it('returns error when code empty', async () => {
      const result = await service.checkDiscount('');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Code required');
    });

    it('returns error when code not found', async () => {
      mockPrisma.discount.findUnique.mockResolvedValue(null);
      const result = await service.checkDiscount('BAD');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Invalid or expired code');
    });

    it('returns success and value when code valid', async () => {
      mockPrisma.discount.findUnique.mockResolvedValue({
        id: 'd1',
        code: 'SAVE10',
        type: 'percent',
        value: 10,
        validFrom: null,
        validTo: null,
      });
      const result = await service.checkDiscount('SAVE10');
      expect(result.mtype).toBe('success');
      expect((result as Record<string, unknown>).valid).toBe(true);
      expect((result as Record<string, unknown>).type).toBe('percent');
      expect((result as Record<string, unknown>).value).toBe(10);
    });
  });

  describe('PaymentList', () => {
    it('returns paid sessions for the customer from DB', async () => {
      const paidSession = {
        id: 'sess-1',
        scheduledAt: new Date('2025-03-10T14:00:00Z'),
        amountCents: 2500,
        status: 'completed',
        createdAt: new Date(),
        activityName: 'Yoga',
      };
      mockPrisma.session.findMany.mockResolvedValue([paidSession]);
      const result = await service.PaymentList('cust-1');
      expect(result.mtype).toBe('success');
      expect(Array.isArray(result.PaymentList)).toBe(true);
      expect(result.list).toEqual(result.PaymentList);
      expect((result.PaymentList as Record<string, unknown>[]).length).toBe(1);
      expect((result.PaymentList as Record<string, unknown>[])[0].date).toBe('2025-03-10');
      expect((result.PaymentList as Record<string, unknown>[])[0].amount).toBe(25);
      expect((result.PaymentList as Record<string, unknown>[])[0].amountCents).toBe(2500);
      expect(mockPrisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { customerId: 'cust-1', amountCents: { not: null } },
          orderBy: { scheduledAt: 'desc' },
        })
      );
    });

    it('returns empty list when customer has no paid sessions', async () => {
      mockPrisma.session.findMany.mockResolvedValue([]);
      const result = await service.PaymentList('cust-1');
      expect(result.mtype).toBe('success');
      expect(result.PaymentList).toEqual([]);
      expect(result.list).toEqual([]);
    });
  });

  describe('faqlist', () => {
    it('returns success with faqlist and list from DB', async () => {
      (mockPrisma.faq.findMany as jest.Mock).mockResolvedValue([
        { id: 'f1', question: 'Q1', answer: 'A1' },
      ]);
      const result = await service.faqlist();
      expect(result.mtype).toBe('success');
      expect(Array.isArray(result.faqlist)).toBe(true);
      expect(result.list).toEqual(result.faqlist);
      expect(mockPrisma.faq.findMany).toHaveBeenCalled();
    });
  });

  describe('contactList', () => {
    it('returns success with contactList and list', () => {
      const result = service.contactList();
      expect(result.mtype).toBe('success');
      expect(Array.isArray(result.contactList)).toBe(true);
      expect(result.list).toEqual(result.contactList);
    });
  });

  describe('fetchContactLink', () => {
    it('returns success with contactEmail from DB or env', async () => {
      (mockPrisma.contactSetting.findUnique as jest.Mock).mockResolvedValue({
        value: 'support@test.com',
      });
      const result = await service.fetchContactLink();
      expect(result.mtype).toBe('success');
      expect((result as Record<string, unknown>).contactEmail).toBe('support@test.com');
      expect(mockPrisma.contactSetting.findUnique).toHaveBeenCalledWith({
        where: { key: 'contact_email' },
      });
    });
  });

  describe('otherConcern', () => {
    it('returns error when message empty', async () => {
      const result = await service.otherConcern('cust-1', undefined, '');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Message required');
      expect(mockPrisma.supportTicket.create).not.toHaveBeenCalled();
    });

    it('creates support ticket with default subject', async () => {
      mockPrisma.supportTicket.create.mockResolvedValue({ id: 'ticket-1' });
      const result = await service.otherConcern('cust-1', undefined, 'Need help');
      expect(result.mtype).toBe('success');
      expect(mockPrisma.supportTicket.create).toHaveBeenCalledWith({
        data: { userId: 'cust-1', subject: 'Other concern', message: 'Need help', status: 'open' },
      });
    });

    it('creates support ticket with custom subject', async () => {
      mockPrisma.supportTicket.create.mockResolvedValue({ id: 'ticket-2' });
      await service.otherConcern('cust-1', 'Billing issue', 'Wrong charge');
      expect(mockPrisma.supportTicket.create).toHaveBeenCalledWith({
        data: {
          userId: 'cust-1',
          subject: 'Billing issue',
          message: 'Wrong charge',
          status: 'open',
        },
      });
    });
  });

  describe('customerreview', () => {
    it('returns error when trainerId empty', async () => {
      const result = await service.customerreview('cust-1', '', 5);
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Trainer is required');
    });

    it('returns error when rating out of range', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'trainer-1', role: 'trainer' });
      const result = await service.customerreview('cust-1', 'trainer-1', 6);
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Rating must be 1-5');
    });

    it('returns error when trainer not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      const result = await service.customerreview('cust-1', 'unknown', 5);
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Trainer not found');
    });

    it('creates review and returns success', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'trainer-1', role: 'trainer' });
      mockPrisma.review.create.mockResolvedValue({ id: 'rev-1' });
      const result = await service.customerreview('cust-1', 'trainer-1', 5, 'Great session');
      expect(result.mtype).toBe('success');
      expect(mockPrisma.review.create).toHaveBeenCalledWith({
        data: {
          trainerId: 'trainer-1',
          customerId: 'cust-1',
          sessionId: null,
          rating: 5,
          comment: 'Great session',
        },
      });
    });
  });
});
