import { Controller, Post, Body } from '@nestjs/common';
import { VibeEngineService } from './vibe-engine.service';

@Controller('vibe-engine')
export class VibeEngineController {
  constructor(private readonly vibeEngineService: VibeEngineService) {}

  @Post('generate')
  async generate(@Body() body: { prompt: string; userId?: string }) {
    return this.vibeEngineService.generateAppArchitecture(
      body.prompt,
      body.userId,
    );
  }
}
