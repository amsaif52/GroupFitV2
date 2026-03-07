import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockLoginResult = {
    accessToken: 'jwt-token',
    user: { id: 'u1', email: 'u@test.com', role: 'customer', locale: 'en' },
  };

  const mockAuthService = {
    login: jest.fn(),
    signup: jest.fn(),
    loginWithGoogle: jest.fn(),
    loginWithApple: jest.fn(),
    sendOtp: jest.fn(),
    resendOtp: jest.fn(),
    verifyOtp: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('returns accessToken and user from service', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResult);

      const result = await controller.login({
        email: 'user@test.com',
        password: 'password123',
      });

      expect(authService.login).toHaveBeenCalledWith('user@test.com', 'password123');
      expect(result).toEqual(mockLoginResult);
    });
  });

  describe('signup', () => {
    it('returns accessToken and user from service', async () => {
      mockAuthService.signup.mockResolvedValue(mockLoginResult);

      const result = await controller.signup({
        name: 'Jane',
        email: 'jane@test.com',
        password: 'password123',
        role: 'customer',
      });

      expect(authService.signup).toHaveBeenCalledWith(
        'jane@test.com',
        'password123',
        'Jane',
        'customer'
      );
      expect(result).toEqual(mockLoginResult);
    });
  });

  describe('sendOtp', () => {
    it('returns message and userCode from service', async () => {
      mockAuthService.sendOtp.mockResolvedValue({
        message: 'OTP sent successfully',
        userCode: 'user-123',
      });

      const result = await controller.sendOtp({
        phoneNumber: '+447700900000',
        role: 'customer',
      });

      expect(authService.sendOtp).toHaveBeenCalledWith('+447700900000', 'customer');
      expect(result).toEqual({ message: 'OTP sent successfully', userCode: 'user-123' });
    });
  });

  describe('verifyOtp', () => {
    it('returns accessToken and user when OTP is valid', async () => {
      mockAuthService.verifyOtp.mockResolvedValue(mockLoginResult);

      const result = await controller.verifyOtp({
        otp: '1234',
        userCode: 'user-123',
      });

      expect(authService.verifyOtp).toHaveBeenCalledWith('1234', 'user-123');
      expect(result).toEqual(mockLoginResult);
    });

    it('throws when service throws UnauthorizedException', async () => {
      mockAuthService.verifyOtp.mockRejectedValue(
        new UnauthorizedException('Otp verification failed. Please retry.')
      );

      await expect(controller.verifyOtp({ otp: '0000', userCode: 'user-123' })).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('resendOtp', () => {
    it('returns message and userCode from service', async () => {
      mockAuthService.resendOtp.mockResolvedValue({
        message: 'OTP sent successfully',
        userCode: 'user-123',
      });

      const result = await controller.resendOtp({
        phoneNumber: '+447700900000',
        userCode: 'user-123',
      });

      expect(authService.resendOtp).toHaveBeenCalledWith('+447700900000', 'user-123');
      expect(result).toEqual({ message: 'OTP sent successfully', userCode: 'user-123' });
    });

    it('throws when service throws BadRequestException', async () => {
      mockAuthService.resendOtp.mockRejectedValue(
        new BadRequestException('User not found for this phone number')
      );

      await expect(controller.resendOtp({ phoneNumber: '+449999999999' })).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
