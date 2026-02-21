import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UsageService } from './usage.service';

@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get(':userId')
  async getUsage(@Param('userId') userId: string) {
    // This just checks the status without incrementing
    return this.usageService.checkAndIncrement(userId, 0);
  }

  @Post(':userId/increment')
  async incrementUsage(
    @Param('userId') userId: string,
    @Query('tokens') tokens: string,
  ) {
    const tokenCount = parseInt(tokens, 10) || 1;
    return this.usageService.checkAndIncrement(userId, tokenCount);
  }
}
