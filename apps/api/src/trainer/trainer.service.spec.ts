import { Test, TestingModule } from '@nestjs/testing';
import { TrainerService } from './trainer.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TrainerService', () => {
  let service: TrainerService;

  const mockSession = {
    id: 'session-1',
    customerId: 'cust-1',
    trainerId: 'trainer-1',
    activityName: 'HIIT',
    scheduledAt: new Date(),
    status: 'scheduled',
    amountCents: 7500,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: { id: 'cust-1', name: 'Customer', email: 'c@test.com' },
  };

  const mockPrisma = {
    user: { findUnique: jest.fn() },
    session: { findMany: jest.fn(), findFirst: jest.fn(), aggregate: jest.fn(), update: jest.fn() },
    referral: { findMany: jest.fn() },
    review: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    trainerCertificate: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    trainerBankDetail: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
    trainerServiceArea: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    faq: { findMany: jest.fn() },
    contactSetting: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainerService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TrainerService>(TrainerService);
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

  describe('deletetrainer', () => {
    it('returns same deletion message as deleteProfile', () => {
      const result = service.deletetrainer();
      expect(result.mtype).toBe('success');
      expect(result.message).toContain('deletion');
    });
  });

  describe('basicdetails', () => {
    it('returns current trainer profile from Prisma', async () => {
      const mockUser = {
        id: 'trainer-1',
        name: 'Coach Jane',
        email: 'jane@test.com',
        role: 'trainer',
        locale: 'en',
        phone: '+15551234567',
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.basicdetails('trainer-1');
      expect(result.mtype).toBe('success');
      expect(result.usercode).toBe('trainer-1');
      expect(result.name).toBe('Coach Jane');
      expect(result.emailid).toBe('jane@test.com');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'trainer-1' } });
    });
  });

  describe('saveSocialLinks', () => {
    it('returns success (stub)', () => {
      const result = service.saveSocialLinks('trainer-1', { facebook: 'https://fb.com/me' });
      expect(result.mtype).toBe('success');
    });
  });

  describe('getSocialLinks', () => {
    it('returns getSocialLinks object with null placeholders', () => {
      const result = service.getSocialLinks();
      expect(result.mtype).toBe('success');
      expect(result.getSocialLinks).toEqual({
        facebook: null,
        instagram: null,
        twitter: null,
        linkedin: null,
      });
    });
  });

  describe('trainerSessionList', () => {
    it('returns upcoming sessions for the trainer', async () => {
      mockPrisma.session.findMany.mockResolvedValue([mockSession]);
      const result = await service.trainerSessionList('trainer-1');
      expect(result.mtype).toBe('success');
      expect(result.trainerSessionList).toHaveLength(1);
      expect((result.trainerSessionList as Record<string, unknown>[])[0].sessionName).toBe('HIIT');
      expect((result.trainerSessionList as Record<string, unknown>[])[0].customerName).toBe('Customer');
      expect(mockPrisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { trainerId: 'trainer-1', status: 'scheduled' },
        }),
      );
    });
  });

  describe('trainerSessionCompletedList', () => {
    it('returns completed sessions for the trainer', async () => {
      mockPrisma.session.findMany.mockResolvedValue([
        { ...mockSession, status: 'completed' },
      ]);
      const result = await service.trainerSessionCompletedList('trainer-1');
      expect(result.trainerSessionCompletedList).toHaveLength(1);
      expect(mockPrisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { trainerId: 'trainer-1', status: 'completed' },
        }),
      );
    });
  });

  describe('todaySession', () => {
    it('returns sessions scheduled for today for the trainer', async () => {
      mockPrisma.session.findMany.mockResolvedValue([mockSession]);
      const result = await service.todaySession('trainer-1');
      expect(result.todaySession).toHaveLength(1);
      expect(mockPrisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            trainerId: 'trainer-1',
            status: 'scheduled',
          }),
        }),
      );
    });
  });

  describe('fetchSessionDetails', () => {
    it('returns session when trainer owns it', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({
        ...mockSession,
        customer: { id: 'cust-1', name: 'Customer', email: 'c@test.com', phone: null },
      });
      const result = await service.fetchSessionDetails('trainer-1', 'session-1');
      expect(result.mtype).toBe('success');
      expect(result.sessionId).toBe('session-1');
      expect(result.customerName).toBe('Customer');
      expect(mockPrisma.session.findFirst).toHaveBeenCalledWith({
        where: { id: 'session-1', trainerId: 'trainer-1' },
        include: expect.any(Object),
      });
    });

    it('returns error when session not found', async () => {
      mockPrisma.session.findFirst.mockResolvedValue(null);
      const result = await service.fetchSessionDetails('trainer-1', 'bad-id');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Session not found');
    });
  });

  describe('SessionUpcomingView', () => {
    it('returns session detail when session is scheduled', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({
        ...mockSession,
        status: 'scheduled',
        customer: { id: 'cust-1', name: 'Customer', email: 'c@test.com', phone: null },
      });
      const result = await service.SessionUpcomingView('trainer-1', 'session-1');
      expect(result.mtype).toBe('success');
      expect((result as Record<string, unknown>).sessionId).toBe('session-1');
    });

    it('returns error when session is completed', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({
        ...mockSession,
        status: 'completed',
        customer: { id: 'cust-1', name: 'Customer', email: 'c@test.com', phone: null },
      });
      const result = await service.SessionUpcomingView('trainer-1', 'session-1');
      expect(result.mtype).toBe('error');
      expect((result as { message: string }).message).toBe('Session not found or not upcoming');
    });
  });

  describe('SessionCompletedView', () => {
    it('returns session detail when session is completed', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({
        ...mockSession,
        status: 'completed',
        customer: { id: 'cust-1', name: 'Customer', email: 'c@test.com', phone: null },
      });
      const result = await service.SessionCompletedView('trainer-1', 'session-1');
      expect(result.mtype).toBe('success');
      expect((result as Record<string, unknown>).sessionId).toBe('session-1');
    });

    it('returns error when session is scheduled', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({
        ...mockSession,
        status: 'scheduled',
        customer: { id: 'cust-1', name: 'Customer', email: 'c@test.com', phone: null },
      });
      const result = await service.SessionCompletedView('trainer-1', 'session-1');
      expect(result.mtype).toBe('error');
      expect((result as { message: string }).message).toBe('Session not found or not completed');
    });
  });

  describe('UpdateSessionCompleteFlag', () => {
    it('returns error when session not found or not scheduled', async () => {
      mockPrisma.session.findFirst.mockResolvedValue(null);
      const result = await service.UpdateSessionCompleteFlag('trainer-1', 'session-1');
      expect(result.mtype).toBe('error');
      expect((result as { message: string }).message).toBe('Session not found or not scheduled');
      expect(mockPrisma.session.update).not.toHaveBeenCalled();
    });

    it('updates session to completed', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({ id: 'session-1', trainerId: 'trainer-1', status: 'scheduled' });
      mockPrisma.session.update.mockResolvedValue(undefined);
      const result = await service.UpdateSessionCompleteFlag('trainer-1', 'session-1');
      expect(result.mtype).toBe('success');
      expect(mockPrisma.session.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: { status: 'completed' },
      });
    });

    it('updates session to completed with amountCents', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({ id: 'session-1', trainerId: 'trainer-1', status: 'scheduled' });
      mockPrisma.session.update.mockResolvedValue(undefined);
      await service.UpdateSessionCompleteFlag('trainer-1', 'session-1', 5000);
      expect(mockPrisma.session.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: { status: 'completed', amountCents: 5000 },
      });
    });
  });

  describe('referralSummary', () => {
    it('returns zero when trainer has no referrals', async () => {
      mockPrisma.referral.findMany.mockResolvedValue([]);
      const result = await service.referralSummary('trainer-1');
      expect(result.mtype).toBe('success');
      expect((result as Record<string, unknown>).referralSummary).toEqual({
        totalReferrals: 0,
        totalEarnedFromReferrals: 0,
      });
      expect(mockPrisma.session.aggregate).not.toHaveBeenCalled();
    });

    it('returns count and earnings from referred customers', async () => {
      mockPrisma.referral.findMany.mockResolvedValue([
        { referredUserId: 'cust-1' },
        { referredUserId: 'cust-2' },
      ]);
      mockPrisma.session.aggregate.mockResolvedValue({ _sum: { amountCents: 15000 } });
      const result = await service.referralSummary('trainer-1');
      expect(result.mtype).toBe('success');
      expect((result as Record<string, unknown>).referralSummary).toEqual({
        totalReferrals: 2,
        totalEarnedFromReferrals: 15000,
      });
      expect(mockPrisma.session.aggregate).toHaveBeenCalledWith({
        where: {
          trainerId: 'trainer-1',
          status: 'completed',
          customerId: { in: ['cust-1', 'cust-2'] },
        },
        _sum: { amountCents: true },
      });
    });
  });

  describe('getSessionAvgRating', () => {
    it('returns 0 rating and 0 count when sessionId empty', async () => {
      const result = await service.getSessionAvgRating('');
      expect(result.mtype).toBe('success');
      expect(result.rating).toBe(0);
      expect(result.reviewCount).toBe(0);
      expect(mockPrisma.review.aggregate).not.toHaveBeenCalled();
    });

    it('returns aggregated rating and count for session', async () => {
      mockPrisma.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: 3,
      });
      const result = await service.getSessionAvgRating('session-1');
      expect(result.mtype).toBe('success');
      expect(result.rating).toBe(4.5);
      expect(result.reviewCount).toBe(3);
      expect(mockPrisma.review.aggregate).toHaveBeenCalledWith({
        where: { sessionId: 'session-1' },
        _avg: { rating: true },
        _count: true,
      });
    });
  });

  describe('FetchReviews', () => {
    it('returns list of reviews for trainer', async () => {
      const mockReviews = [
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
      mockPrisma.review.findMany.mockResolvedValue(mockReviews);
      const result = await service.FetchReviews('trainer-1');
      expect(result.mtype).toBe('success');
      expect(result.FetchReviews).toHaveLength(1);
      expect((result.FetchReviews as Record<string, unknown>[])[0].customerName).toBe('Customer');
      expect((result.FetchReviews as Record<string, unknown>[])[0].rating).toBe(5);
    });
  });

  describe('getTrainerAvgRating', () => {
    it('returns rating and reviewCount from aggregate', async () => {
      mockPrisma.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.2 },
        _count: 10,
      });
      const result = await service.getTrainerAvgRating('trainer-1');
      expect(result.mtype).toBe('success');
      expect(result.rating).toBe(4.2);
      expect(result.reviewCount).toBe(10);
    });

    it('returns 0 when no reviews', async () => {
      mockPrisma.review.aggregate.mockResolvedValue({ _avg: { rating: null }, _count: 0 });
      const result = await service.getTrainerAvgRating('trainer-1');
      expect(result.rating).toBe(0);
      expect(result.reviewCount).toBe(0);
    });
  });

  describe('trainerCertificateList', () => {
    it('returns list of certificates for trainer', async () => {
      const certs = [
        {
          id: 'cert-1',
          name: 'CPR',
          issuingOrganization: 'Red Cross',
          issuedAt: new Date(),
          credentialId: null,
          documentUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockPrisma.trainerCertificate.findMany.mockResolvedValue(certs);
      const result = await service.trainerCertificateList('trainer-1');
      expect(result.mtype).toBe('success');
      expect(result.trainerCertificateList).toHaveLength(1);
      expect((result.trainerCertificateList as Record<string, unknown>[])[0].name).toBe('CPR');
    });
  });

  describe('addTrainerCertificate', () => {
    it('returns error when name empty', async () => {
      const result = await service.addTrainerCertificate('trainer-1', '');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Name is required');
    });

    it('creates certificate and returns id', async () => {
      mockPrisma.trainerCertificate.create.mockResolvedValue({ id: 'new-cert' });
      const result = await service.addTrainerCertificate('trainer-1', 'NASM');
      expect(result.mtype).toBe('success');
      expect(result.id).toBe('new-cert');
      expect(mockPrisma.trainerCertificate.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ name: 'NASM', trainerId: 'trainer-1' }) }),
      );
    });
  });

  describe('viewCertification', () => {
    it('returns error when certificate not found', async () => {
      mockPrisma.trainerCertificate.findFirst.mockResolvedValue(null);
      const result = await service.viewCertification('trainer-1', 'bad-id');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Certificate not found');
    });

    it('returns certificate details when found', async () => {
      mockPrisma.trainerCertificate.findFirst.mockResolvedValue({
        id: 'cert-1',
        name: 'CPR',
        issuingOrganization: 'Red Cross',
        issuedAt: new Date(),
        credentialId: null,
        documentUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const result = await service.viewCertification('trainer-1', 'cert-1');
      expect(result.mtype).toBe('success');
      expect(result.name).toBe('CPR');
      expect(result.issuingOrganization).toBe('Red Cross');
    });
  });

  describe('deleteCertification', () => {
    it('returns error when certificate not found', async () => {
      mockPrisma.trainerCertificate.findFirst.mockResolvedValue(null);
      const result = await service.deleteCertification('trainer-1', 'bad-id');
      expect(result.mtype).toBe('error');
      expect(mockPrisma.trainerCertificate.delete).not.toHaveBeenCalled();
    });

    it('deletes certificate when found', async () => {
      mockPrisma.trainerCertificate.findFirst.mockResolvedValue({ id: 'cert-1' });
      const result = await service.deleteCertification('trainer-1', 'cert-1');
      expect(result.mtype).toBe('success');
      expect(mockPrisma.trainerCertificate.delete).toHaveBeenCalledWith({ where: { id: 'cert-1' } });
    });
  });

  describe('addTrainerBankDetails', () => {
    it('returns error when account holder name empty', async () => {
      const result = await service.addTrainerBankDetails('trainer-1', '', 'Bank', '1234');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Account holder name is required');
    });

    it('returns error when last4 invalid', async () => {
      const result = await service.addTrainerBankDetails('trainer-1', 'John', 'Bank', '12');
      expect(result.mtype).toBe('error');
      expect(result.message).toContain('Last 4');
    });

    it('calls upsert with normalized last4', async () => {
      mockPrisma.trainerBankDetail.upsert.mockResolvedValue(undefined);
      const result = await service.addTrainerBankDetails('trainer-1', 'John Doe', 'Bank', '1234');
      expect(result.mtype).toBe('success');
      expect(mockPrisma.trainerBankDetail.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { trainerId: 'trainer-1' },
          create: expect.objectContaining({ accountHolderName: 'John Doe', last4: '1234' }),
        }),
      );
    });
  });

  describe('viewTrainerBankDetails', () => {
    it('returns error when bank details not found', async () => {
      mockPrisma.trainerBankDetail.findUnique.mockResolvedValue(null);
      const result = await service.viewTrainerBankDetails('trainer-1');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Bank details not found');
    });

    it('returns bank details when found', async () => {
      mockPrisma.trainerBankDetail.findUnique.mockResolvedValue({
        id: 'bank-1',
        accountHolderName: 'John',
        bankName: 'Bank',
        last4: '1234',
        routingLast4: null,
        createdAt: new Date(),
      });
      const result = await service.viewTrainerBankDetails('trainer-1');
      expect(result.mtype).toBe('success');
      expect(result.accountHolderName).toBe('John');
      expect(result.last4).toBe('1234');
    });
  });

  describe('trainerServiceList', () => {
    it('returns list of service areas', async () => {
      const areas = [
        {
          id: 'area-1',
          label: 'Downtown',
          address: null,
          latitude: null,
          longitude: null,
          radiusKm: null,
          isActive: true,
          createdAt: new Date(),
        },
      ];
      mockPrisma.trainerServiceArea.findMany.mockResolvedValue(areas);
      const result = await service.trainerServiceList('trainer-1');
      expect(result.mtype).toBe('success');
      expect(result.trainerServiceList).toHaveLength(1);
      expect((result.trainerServiceList as Record<string, unknown>[])[0].label).toBe('Downtown');
    });
  });

  describe('addTrainerService', () => {
    it('returns error when label empty', async () => {
      const result = await service.addTrainerService('trainer-1', '');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Label is required');
    });

    it('creates service area and returns id', async () => {
      mockPrisma.trainerServiceArea.create.mockResolvedValue({ id: 'new-area' });
      const result = await service.addTrainerService('trainer-1', 'North Side');
      expect(result.mtype).toBe('success');
      expect(result.id).toBe('new-area');
      expect(mockPrisma.trainerServiceArea.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ label: 'North Side', trainerId: 'trainer-1' }) }),
      );
    });
  });

  describe('viewServiceArea', () => {
    it('returns single area when id provided', async () => {
      mockPrisma.trainerServiceArea.findFirst.mockResolvedValue({
        id: 'area-1',
        label: 'Downtown',
        address: null,
        latitude: null,
        longitude: null,
        radiusKm: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const result = await service.viewServiceArea('trainer-1', 'area-1');
      expect(result.mtype).toBe('success');
      expect((result as Record<string, unknown>).id).toBe('area-1');
      expect((result as Record<string, unknown>).label).toBe('Downtown');
    });

    it('returns list when id not provided', async () => {
      mockPrisma.trainerServiceArea.findMany.mockResolvedValue([]);
      const result = await service.viewServiceArea('trainer-1');
      expect(result.mtype).toBe('success');
      expect((result as Record<string, unknown>).trainerServiceList).toEqual([]);
    });

    it('returns error when area not found for id', async () => {
      mockPrisma.trainerServiceArea.findFirst.mockResolvedValue(null);
      const result = await service.viewServiceArea('trainer-1', 'bad-id');
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Service area not found');
    });
  });

  describe('serviceAreaOnOff', () => {
    it('returns error when area not found', async () => {
      mockPrisma.trainerServiceArea.findFirst.mockResolvedValue(null);
      const result = await service.serviceAreaOnOff('trainer-1', 'bad-id', true);
      expect(result.mtype).toBe('error');
      expect(result.message).toBe('Service area not found');
    });

    it('toggles isActive when isActive not provided', async () => {
      mockPrisma.trainerServiceArea.findFirst.mockResolvedValue({
        id: 'area-1',
        isActive: true,
        trainerId: 'trainer-1',
      });
      mockPrisma.trainerServiceArea.update.mockResolvedValue(undefined);
      const result = await service.serviceAreaOnOff('trainer-1', 'area-1');
      expect(result.mtype).toBe('success');
      expect(result.isActive).toBe(false);
      expect(mockPrisma.trainerServiceArea.update).toHaveBeenCalledWith({
        where: { id: 'area-1' },
        data: { isActive: false },
      });
    });

    it('sets isActive to provided value', async () => {
      mockPrisma.trainerServiceArea.findFirst.mockResolvedValue({
        id: 'area-1',
        isActive: false,
        trainerId: 'trainer-1',
      });
      mockPrisma.trainerServiceArea.update.mockResolvedValue(undefined);
      const result = await service.serviceAreaOnOff('trainer-1', 'area-1', true);
      expect(result.mtype).toBe('success');
      expect(result.isActive).toBe(true);
      expect(mockPrisma.trainerServiceArea.update).toHaveBeenCalledWith({
        where: { id: 'area-1' },
        data: { isActive: true },
      });
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
      expect((result.faqlist as { id: string }[]).length).toBe(1);
      expect(mockPrisma.faq.findMany).toHaveBeenCalled();
    });
  });

  describe('fetchContactLink', () => {
    it('returns success with contactEmail from DB or env', async () => {
      (mockPrisma.contactSetting.findUnique as jest.Mock).mockResolvedValue({ value: 'help@test.com' });
      const result = await service.fetchContactLink();
      expect(result.mtype).toBe('success');
      expect((result as Record<string, unknown>).contactEmail).toBe('help@test.com');
      expect(mockPrisma.contactSetting.findUnique).toHaveBeenCalledWith({ where: { key: 'contact_email' } });
    });
  });

  describe('screenFlags', () => {
    it('returns success with screenFlags object', () => {
      const result = service.screenFlags();
      expect(result.mtype).toBe('success');
      expect((result as Record<string, unknown>).screenFlags).toEqual({});
    });
  });

  describe('getAdditionalImageCodes', () => {
    it('returns success with empty codes list', () => {
      const result = service.getAdditionalImageCodes();
      expect(result.mtype).toBe('success');
      expect(Array.isArray((result as Record<string, unknown>).getAdditionalImageCodes)).toBe(true);
      expect((result as Record<string, unknown>).codes).toEqual([]);
    });
  });

  describe('addAdditionalImageCodes', () => {
    it('returns success', () => {
      const result = service.addAdditionalImageCodes();
      expect(result.mtype).toBe('success');
    });
  });

  describe('removeAdditionalImageCodes', () => {
    it('returns success', () => {
      const result = service.removeAdditionalImageCodes();
      expect(result.mtype).toBe('success');
    });
  });
});
