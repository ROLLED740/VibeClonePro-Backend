import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TelemetryGateway } from '../telemetry/telemetry.gateway';
import { StitchService } from '../stitch/stitch.service';

import { UsageService } from '../usage/usage.service';
import { UserService } from '../user/user.service';
import { decrypt } from '../lib/encryption';

@Injectable()
export class VibeEngineService {
  private readonly logger = new Logger(VibeEngineService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private telemetryGateway: TelemetryGateway,
    private stitchService: StitchService,
    private userService: UserService,
    private usageService: UsageService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateAppArchitecture(prompt: string, userId?: string) {
    this.logger.log(
      `Generating architecture for: ${prompt} (User: ${userId || 'System'})`,
    );

    // 1. Resolve API Key (BYOK Suite)
    let selectedApiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (userId) {
      // 1a. Check Usage Guardrail (Check Before You Burn)
      // If the user has a BYOK, we skip the limit check (they pay for their own tokens)
      const user = await this.userService.findOne(userId);
      if (user?.googleKey) {
        selectedApiKey = decrypt(user.googleKey);

        this.logger.log(`Using BYOK (Google) for user ${userId}`);
      } else {
        // Enforce limit only for system-key users
        await this.usageService.checkAndIncrement(userId);
        this.logger.log(
          `Using System Key for user ${userId}. Token decremented.`,
        );
      }
    }

    if (!selectedApiKey) {
      throw new Error('No API Key available (System or BYOK)');
    }

    const customGenAI = new GoogleGenerativeAI(selectedApiKey);
    this.telemetryGateway.broadcastUpdate('buildStatus', {
      status: 'generating_architecture',
      message: 'Vibe Engine is analyzing your request...',
      progress: 20,
    });

    const model = customGenAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    let appcontext = prompt;
    if (prompt.startsWith('http')) {
      appcontext = `REVERSE ENGINEER THIS URL: ${prompt}. Analyze its features, UI structure, and business model.`;
    }

    const systemInstruction = `
      You are Vibe Engine, an elite AI Software Architect.
      Create a detailed technical architecture for the following app request.
      If a URL is provided, clone its behavior and structure but optimize for high-fidelity SaaS.
      Return a STRICT JSON object with:
      1. appName
      2. techStack (Frontend, Backend, DB)
      3. coreModules (list of features)
      4. dataSchema (key entities)
      5. deploymentPlan (Vercel, Neon, GCP)
    `;

    const result = await model.generateContent([systemInstruction, appcontext]);
    const response = result.response;
    const text = response.text();

    this.telemetryGateway.broadcastUpdate('buildStatus', {
      status: 'architecture_complete',
      message: 'Architecture blueprint finalized. Weaving UI...',
      progress: 60,
    });

    // START STITCH AUTOMATION
    let uiOutput: Record<string, unknown> | null = null;
    try {
      uiOutput = await this.stitchService.generateUIFromText(prompt);
      this.telemetryGateway.broadcastUpdate('buildStatus', {
        status: 'ui_complete',
        message: 'Stitch UI generation successful.',
        progress: 90,
      });
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(
        `Stitch UI generation failed: ${err.message}, continuing architecture only`,
      );
    }

    this.telemetryGateway.broadcastUpdate('buildStatus', {
      status: 'complete',
      message: 'App build finished. Ready for deployment.',
      progress: 100,
    });

    return {
      architecture: text,
      ui: uiOutput,
      timestamp: new Date().toISOString(),
    };
  }
}
