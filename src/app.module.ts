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
// import { Telemetry } from './telemetry/telemetry.entity'; // Will add later

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
        entities: [User, Vault], // Add entities here
        synchronize: true, // Auto-create tables (dev only)
      }),
      inject: [ConfigService],
    }),
    UserModule,
    VaultModule,
    TelemetryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
