import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// Импортируем типы
import { AuthResponse, TokenResponse, UserResponse, JwtPayload } from '../../types';
import { User } from "../../entities";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterDto): Promise<AuthResponse> {
        const { email, username, password, firstName, lastName } = registerDto;

        // Проверка существующего пользователя
        const existingUser = await this.userRepository.findOne({
            where: [{ email }, { username }],
        });

        if (existingUser) {
            throw new ConflictException('Пользователь с таким email или username уже существует');
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание пользователя
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

        // Генерация токенов
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

        // Обновление времени последнего входа
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
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_SECRET,
            });

            const user = await this.userRepository.findOne({
                where: { id: payload.sub }
            });

            if (!user || user.refreshToken !== refreshToken) {
                throw new UnauthorizedException('Невалидный refresh token');
            }

            const tokens = await this.generateTokens(user);

            return tokens;
        } catch (error) {
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

    async updateProfile(userId: string, updateData: any): Promise<UserResponse> {
        // Разрешенные поля для обновления
        const allowedFields = ['firstName', 'lastName', 'avatar'];
        const filteredData: any = {};

        for (const key of Object.keys(updateData)) {
            if (allowedFields.includes(key)) {
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

    async updatePreferences(userId: string, preferences: any): Promise<UserResponse> {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new UnauthorizedException('Пользователь не найден');
        }

        // Обновляем только переданные поля
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
            role: user.role
        };

        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload);

        // Сохраняем refresh token
        await this.userRepository.update(user.id, { refreshToken });

        return {
            accessToken,
            refreshToken,
            expiresIn: 86400, // 24 часа в секундах
        };
    }

    private sanitizeUser(user: User): UserResponse {
        // Деструктурируем и возвращаем без пароля и refreshToken
        const { password, refreshToken, ...sanitizedUser } = user;
        return sanitizedUser as unknown as UserResponse;
    }
}