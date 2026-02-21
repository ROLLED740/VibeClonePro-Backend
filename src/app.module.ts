import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { VaultModule } from './vault/vault.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { User } from './user/user.entity';
import { Vault } from './vault/vault.entity';
import { UserUsage } from './usage/usage.entity';
import { UsageModule } from './usage/usage.module';

import { StripeModule } from './stripe/stripe.module';
import { VibeEngineModule } from './vibe-engine/vibe-engine.module';
import { StitchModule } from './stitch/stitch.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Vault, UserUsage], // Add entities here
        synchronize: true, // Auto-create tables (dev only)
        ssl: true,
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    VaultModule,
    TelemetryModule,
    StripeModule,
    VibeEngineModule,
    StitchModule,
    UsageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
