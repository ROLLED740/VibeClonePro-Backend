import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: Partial<User>) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post(':id/keys')
  updateKeys(
    @Param('id') id: string,
    @Body()
    keys: { openaiKey?: string; googleKey?: string; anthropicKey?: string },
  ) {
    return this.userService.updateKeys(id, keys);
  }
}
