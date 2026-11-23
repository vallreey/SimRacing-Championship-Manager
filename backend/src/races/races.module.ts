import { Module } from '@nestjs/common';
import { RacesService } from './races.service.js';
import { RacesController } from './races.controller.js';

@Module({
  controllers: [RacesController],
  providers: [RacesService],
})
export class RacesModule {}
