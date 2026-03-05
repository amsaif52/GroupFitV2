import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockUserWithPassword = {
    id: 'user-1',
    email: 'user@test.com',
    name: 'Test User',
    passwordHash: 'hashed',
    googleId: null,
    appleId: null,
    role: 'customer',
    locale: 'en',
    phone: null,
    otp: null,
    otpSentAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-otp-1',
    email: 'p447700900000@otp.groupfit.local',
    name: null,
    passwordHash: null,
    googleId: null,
    appleId: null,
    role: 'customer',
    locale: 'en',
    phone: '+447700900000',
    otp: '1234',
    otpSentAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('fake-jwt') },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('login', () => {
    it('returns LoginResult when email and password are valid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUserWithPassword);

      const result = await service.login('user@test.com', 'password123');

      expect(result.accessToken).toBe('fake-jwt');
      expect(result.user.email).toBe('user@test.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed');
    });

    it('throws UnauthorizedException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login('unknown@test.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when password does not match', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUserWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('user@test.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('signup', () => {
    it('creates user and returns LoginResult when email is new', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        ...mockUserWithPassword,
        email: 'new@test.com',
        name: 'Jane',
      });

      const result = await service.signup('new@test.com', 'password123', 'Jane', 'customer');

      expect(result.accessToken).toBe('fake-jwt');
      expect(result.user.email).toBe('new@test.com');
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@test.com',
          name: 'Jane',
          passwordHash: 'hashed',
          role: 'customer',
          locale: 'en',
        },
      });
    });

    it('throws ConflictException when email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUserWithPassword);

      await expect(
        service.signup('user@test.com', 'password123'),
      ).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('sendOtp', () => {
    it('creates user and returns userCode when phone is new', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ ...mockUser, id: 'new-id' });

      const result = await service.sendOtp('+447700900000');

      expect(result).toEqual({ message: 'OTP sent successfully', userCode: 'new-id' });
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            phone: '+447700900000',
            role: 'customer',
            otp: expect.any(String),
            otpSentAt: expect.any(Date),
          }),
        }),
      );
    });

    it('updates existing user OTP when phone exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const result = await service.sendOtp('+447700900000');

      expect(result.userCode).toBe(mockUser.id);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: { otp: expect.any(String), otpSentAt: expect.any(Date) },
        }),
      );
    });

    it('throws BadRequestException for short phone', async () => {
      await expect(service.sendOtp('123')).rejects.toThrow(BadRequestException);
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('resendOtp', () => {
    it('updates OTP and returns userCode when user exists by phone', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const result = await service.resendOtp('+447700900000');

      expect(result).toEqual({ message: 'OTP sent successfully', userCode: mockUser.id });
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it('throws BadRequestException when user not found for phone', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.resendOtp('+449999999999')).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyOtp', () => {
    it('returns LoginResult and clears OTP when OTP is valid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, otp: null, otpSentAt: null });

      const result = await service.verifyOtp('1234', mockUser.id);

      expect(result.accessToken).toBe('fake-jwt');
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { otp: null, otpSentAt: null },
      });
    });

    it('throws UnauthorizedException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.verifyOtp('1234', 'bad-id')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when OTP does not match', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.verifyOtp('9999', mockUser.id)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when OTP is expired', async () => {
      const expiredUser = {
        ...mockUser,
        otpSentAt: new Date(Date.now() - 10 * 60 * 1000),
      };
      mockPrisma.user.findUnique.mockResolvedValue(expiredUser);
      mockPrisma.user.update.mockResolvedValue(expiredUser);

      await expect(service.verifyOtp('1234', mockUser.id)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { otp: null, otpSentAt: null },
      });
    });
  });
});
