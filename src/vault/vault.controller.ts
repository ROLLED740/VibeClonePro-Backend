import { Controller, Get, Post, Body, Param } from '@nestjs/common';

import { VaultService } from './vault.service';

@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Post()
  create(
    @Body() createVaultDto: { name: string; content: string; ownerId: string },
  ) {
    return this.vaultService.create(
      createVaultDto.name,
      createVaultDto.content,
      createVaultDto.ownerId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vaultService.findOne(id);
  }

  @Get(':id/reveal')
  reveal(@Param('id') id: string) {
    return this.vaultService.getDecryptedContent(id);
  }
}
