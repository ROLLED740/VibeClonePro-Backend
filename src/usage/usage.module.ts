import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserUsage } from './usage.entity';

import { UsageService } from './usage.service';
import { UsageController } from './usage.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserUsage])],
  controllers: [UsageController],
  providers: [UsageService],
  exports: [TypeOrmModule, UsageService],
})
export class UsageModule {}
