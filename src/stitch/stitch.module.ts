import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StitchService } from './stitch.service';

@Module({
  imports: [HttpModule],
  providers: [StitchService],
  exports: [StitchService],
})
export class StitchModule {}
