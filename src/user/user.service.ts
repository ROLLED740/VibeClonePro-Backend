import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

import { StripeService } from '../stripe/stripe.service';
import { encrypt } from '../lib/encryption';

import { UserUsage } from '../usage/usage.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserUsage)
    private usageRepository: Repository<UserUsage>,
    private stripeService: StripeService,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async create(user: Partial<User>): Promise<User> {
    // In a real app, hash password here
    const newUser = this.usersRepository.create(user);
    if (!newUser.stripeCustomerId) {
      const customer = await this.stripeService.createCustomer(
        newUser.email,
        newUser.email,
      ); // using email as name for now
      newUser.stripeCustomerId = customer.id;
    }
    return this.usersRepository.save(newUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async updateKeys(
    id: string,
    keys: { openaiKey?: string; googleKey?: string; anthropicKey?: string },
  ) {
    const user = await this.usersRepository.findOneBy({ id });
    if (user) {
      // Helper: Encrypt only if not already encrypted (contains ':')
      const secureWrap = (val: string) =>
        val && !val.includes(':') ? encrypt(val) : val;

      if (keys.openaiKey) user.openaiKey = secureWrap(keys.openaiKey);
      if (keys.googleKey) user.googleKey = secureWrap(keys.googleKey);
      if (keys.anthropicKey) user.anthropicKey = secureWrap(keys.anthropicKey);
      await this.usersRepository.save(user);
    }
  }

  async updateStatus(stripeCustomerId: string, status: string) {
    const user = await this.usersRepository.findOneBy({ stripeCustomerId });
    if (user) {
      user.subscriptionStatus = status;
      await this.usersRepository.save(user);

      // Initialize usage tracking if subscription becomes active
      if (status === 'active') {
        const usage = await this.usageRepository.findOneBy({ id: user.id });
        if (!usage) {
          const newUsage = this.usageRepository.create({
            id: user.id,
            tokensUsed: 0,
            monthlyLimit: 50, // $29 plan default
          });
          await this.usageRepository.save(newUsage);
        }
      }
    }
  }
}
