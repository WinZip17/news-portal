import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProxyController } from './controllers/proxy.controller';

@Module({
  controllers: [AppController, ProxyController],
})
export class AppModule {}
