import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Put,
    Request,
    Query,
    Delete,
    Param
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {RolesGuard} from "./guards/roles.guard";
import {Roles} from "./decorators/roles.decorator";
import {UpdateUserDto} from "./dto/update-user.dto";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Регистрация нового пользователя' })
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Вход в систему' })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Обновление токена' })
    refreshToken(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Выход из системы' })
    logout(@Request() req) {
        return this.authService.logout(req.user.id);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Получение текущего пользователя' })
    getCurrentUser(@Request() req) {
        return this.authService.getCurrentUser(req.user.id);
    }

    @Put('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Обновление профиля' })
    updateProfile(@Request() req, @Body() updateData: any) {
        return this.authService.updateProfile(req.user.id, updateData);
    }

    @Put('preferences')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Обновление настроек' })
    updatePreferences(@Request() req, @Body() preferences: any) {
        return this.authService.updatePreferences(req.user.id, preferences);
    }

    @Get('stats/users')
    @ApiOperation({ summary: 'Количество пользователей' })
    async getUsersCount() {
        return { totalUsers: await this.authService.getTotalUsers() };
    }

    @Get('users')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Список пользователей (только для админов)' })
    async getUsers(@Query('page') page = 1, @Query('limit') limit = 20) {
        return this.authService.getAllUsers(page, limit);
    }

    @Put('users/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Обновление пользователя (только для админов)' })
    async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.authService.updateUser(id, dto);
    }

    @Delete('users/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Удаление пользователя (только для админов)' })
    async deleteUser(@Param('id') id: string) {
        return this.authService.deleteUser(id);
    }
}