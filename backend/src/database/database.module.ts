import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseInitService } from './database-init.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DatabaseInitService],
  exports: [DatabaseInitService],
})
export class DatabaseModule {
}