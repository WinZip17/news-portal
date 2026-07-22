import { Controller, Get, Render } from '@nestjs/common';

@Controller('login')
export class AuthController {
  @Get()
  @Render('login')
  login() {
    return { framework: 'nestjs' };
  }
}
