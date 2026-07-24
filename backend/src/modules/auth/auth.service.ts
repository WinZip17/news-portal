import { Injectable, UnauthorizedException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse, TokenResponse, UserResponse, UserPreferences, ProfileUpdateData, UserRole } from '../../types';
import { User } from '../../entities';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, username, password, firstName, lastName } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email или username уже существует');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      preferences: {
        categories: [],
        tags: [],
        language: 'ru',
        notificationsEnabled: true,
        emailNotifications: false,
        theme: 'light' as const,
      },
    });

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Аккаунт деактивирован');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Невалидный refresh token');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Невалидный refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: null });
  }

  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, updateData: ProfileUpdateData): Promise<UserResponse> {
    const allowedFields: (keyof ProfileUpdateData)[] = ['firstName', 'lastName', 'avatar'];
    const filteredData: Partial<ProfileUpdateData> = {};

    for (const key of Object.keys(updateData) as (keyof ProfileUpdateData)[]) {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    }

    if (Object.keys(filteredData).length > 0) {
      await this.userRepository.update(userId, filteredData);
    }

    const updatedUser = await this.userRepository.findOne({ where: { id: userId } });

    if (!updatedUser) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return this.sanitizeUser(updatedUser);
  }

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    user.preferences = {
      ...user.preferences,
      ...preferences,
    };

    await this.userRepository.save(user);

    return this.sanitizeUser(user);
  }

  private async generateTokens(user: User): Promise<TokenResponse> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload);

    await this.userRepository.update(user.id, { refreshToken });

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400,
    };
  }

  private sanitizeUser(user: User): UserResponse {
    const { password: _password, refreshToken: _refreshToken, ...sanitizedUser } = user;
    return sanitizedUser as unknown as UserResponse;
  }

  async getTotalUsers(): Promise<number> {
    return this.userRepository.count();
  }

  async getAllUsers(page = 1, limit = 20): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.userRepository.findAndCount({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, dto);
    return this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Нельзя удалить суперадмина');
    }
    await this.userRepository.delete(id);
  }

  async adminUpdateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Нельзя изменить суперадмина');
    }

    const allowedFields: (keyof UpdateUserDto)[] = ['email', 'username', 'firstName', 'lastName', 'role', 'isActive', 'preferences'];

    for (const field of allowedFields) {
      if (dto[field] !== undefined) {
        (user as unknown as Record<string, unknown>)[field] = dto[field];
      }
    }

    await this.userRepository.save(user);

    return this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        preferences: true,
      },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) throw new NotFoundException('Пользователь не найден');

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Неверный текущий пароль');

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }
}
