import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User, UserRole } from '../../entities';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, jest, expect, describe, it } from '@jest/globals';

jest.mock('bcrypt', () => ({
  hash: jest.fn<() => Promise<string>>().mockResolvedValue('hashedPassword'),
  compare: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;

  const mockUser: User = {
    id: '123',
    email: 'test@test.com',
    username: 'testuser',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    avatar: '',
    role: UserRole.USER,
    isActive: true,
    refreshToken: null,
    lastLoginAt: null,
    preferences: {
      categories: [],
      tags: [],
      language: 'ru',
      notificationsEnabled: true,
      emailNotifications: false,
      theme: 'light',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    news: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword' as never);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            findAndCount: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
            verify: jest.fn().mockReturnValue({ sub: '123' }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(userRepository, 'create').mockReturnValue(mockUser);
    jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);
    jest.spyOn(userRepository, 'update').mockResolvedValue({} as never);
    jest.spyOn(userRepository, 'findAndCount').mockResolvedValue([[mockUser], 1]);
    jest.spyOn(userRepository, 'count').mockResolvedValue(1);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto = { email: 'test@test.com', username: 'testuser', password: 'Password123' };
      const result = await service.register(dto);
      expect(result).toHaveProperty('accessToken');
    });

    it('should throw if user exists', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
      const dto = { email: 'test@test.com', username: 'testuser', password: 'Password123' };
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
      const dto = { email: 'test@test.com', password: 'Password123' };
      const result = await service.login(dto);
      expect(result).toHaveProperty('accessToken');
    });

    it('should throw with wrong password', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false as never);
      const dto = { email: 'test@test.com', password: 'Wrong' };
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
