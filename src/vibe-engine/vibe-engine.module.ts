import { Module } from '@nestjs/common';
import { VibeEngineService } from './vibe-engine.service';
import { VibeEngineController } from './vibe-engine.controller';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { StitchModule } from '../stitch/stitch.module';
import { UserModule } from '../user/user.module';
import { UsageModule } from '../usage/usage.module';

@Module({
  imports: [TelemetryModule, StitchModule, UserModule, UsageModule],
  controllers: [VibeEngineController],
  providers: [VibeEngineService],
  exports: [VibeEngineService],
})
export class VibeEngineModule {}
