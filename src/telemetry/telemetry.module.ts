import { Module } from '@nestjs/common';
import { TelemetryGateway } from './telemetry.gateway';
import { TelemetryService } from './telemetry.service';

@Module({
  providers: [TelemetryGateway, TelemetryService],
  exports: [TelemetryService, TelemetryGateway],
})
export class TelemetryModule {}
