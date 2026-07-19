import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { beforeEach, jest, expect, describe, it } from '@jest/globals';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthResponse = {
    accessToken: 'test-token',
    refreshToken: 'test-refresh',
    expiresIn: 86400,
    user: { id: '123', email: 'test@test.com', username: 'testuser', role: 'user', isActive: true },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue(mockAuthResponse as never),
            login: jest.fn().mockResolvedValue(mockAuthResponse as never),
            getCurrentUser: jest.fn().mockResolvedValue(mockAuthResponse.user as never),
            logout: jest.fn().mockResolvedValue(undefined as never),
            updateProfile: jest.fn().mockResolvedValue(mockAuthResponse.user as never),
            getAllUsers: jest.fn().mockResolvedValue({ data: [], total: 0 } as never),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register', async () => {
    const dto = { email: 'test@test.com', username: 'test', password: 'Password123' };
    const result = await controller.register(dto);
    expect(result.accessToken).toBe('test-token');
  });

  it('should login', async () => {
    const dto = { email: 'test@test.com', password: 'Password123' };
    const result = await controller.login(dto);
    expect(result.accessToken).toBe('test-token');
  });

  it('should get current user', async () => {
    const req = { user: { id: '123' } };
    const result = await controller.getCurrentUser(req);
    expect(result.email).toBe('test@test.com');
  });
});