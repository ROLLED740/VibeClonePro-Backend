import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaultController } from './vault.controller';
import { VaultService } from './vault.service';
import { Vault } from './vault.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vault])],
  controllers: [VaultController],
  providers: [VaultService],
})
export class VaultModule {}
