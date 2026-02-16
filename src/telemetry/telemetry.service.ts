import { Injectable } from '@nestjs/common';
import { TelemetryGateway } from './telemetry.gateway';

@Injectable()
export class TelemetryService {
    constructor(private readonly gateway: TelemetryGateway) { }

    sendBuildUpdate(buildId: string, status: string, logs: string[] = []) {
        this.gateway.server.emit('buildUpdate', { buildId, status, logs, timestamp: new Date() });
    }

    sendSystemVitals(cpu: number, memory: number) {
        this.gateway.server.emit('systemVitals', { cpu, memory, timestamp: new Date() });
    }
}
