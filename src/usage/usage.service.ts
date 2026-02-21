import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserUsage } from './usage.entity';

@Injectable()
export class UsageService {
  constructor(
    @InjectRepository(UserUsage)
    private usageRepository: Repository<UserUsage>,
  ) {}

  async checkAndIncrement(userId: string, tokens: number = 1) {
    const usage = await this.usageRepository.findOneBy({ id: userId });

    if (!usage) {
      throw new ForbiddenException(
        'No subscription usage record found. Please subscribe to $29 Tier.',
      );
    }

    // Reset logic: If it's a new month, reset tokens (simplified for demo)
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    if (usage.lastReset < oneMonthAgo) {
      usage.tokensUsed = 0;
      usage.lastReset = now;
    }

    if (usage.tokensUsed + tokens > usage.monthlyLimit) {
      throw new ForbiddenException(
        `Monthly limit reached (${usage.monthlyLimit}). Please upgrade or wait for reset.`,
      );
    }

    usage.tokensUsed += tokens;
    await this.usageRepository.save(usage);
    return usage;
  }
}
