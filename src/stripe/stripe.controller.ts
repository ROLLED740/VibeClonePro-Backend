import {
  Controller,
  Post,
  Body,
  Headers,
  Res,
  Req,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import Stripe from 'stripe';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Post('checkout')
  async createCheckoutSession(
    @Body() body: { customerId: string; priceId: string },
  ) {
    if (!body.customerId || !body.priceId) {
      throw new BadRequestException('CustomerId and PriceId are required');
    }
    const session = await this.stripeService.createCheckoutSession(
      body.customerId,
      body.priceId,
    );
    return { url: session.url };
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!signature || !webhookSecret) {
      throw new BadRequestException('Missing signature or webhook secret');
    }

    if (!req.rawBody) {
      throw new BadRequestException('Request raw body is missing');
    }

    let event: Stripe.Event;
    try {
      event = this.stripeService.constructEvent(
        req.rawBody,
        signature,
        webhookSecret,
      );
    } catch (err: unknown) {
      const error = err as Error;
      console.error(`Webhook signature verification failed: ${error.message}`);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await this.userService.updateStatus(
          session.customer as string,
          'active',
        );
        break;
      }
      case 'customer.subscription.deleted': {
        const subDeleted = event.data.object;
        await this.userService.updateStatus(
          subDeleted.customer as string,
          'canceled',
        );
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send({ received: true });
  }
}
