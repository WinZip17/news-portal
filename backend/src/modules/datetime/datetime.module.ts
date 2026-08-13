import { Module } from '@nestjs/common';
import { DatetimeGateway } from './datetime.gateway';

@Module({
  providers: [DatetimeGateway],
})
export class DatetimeModule {}
