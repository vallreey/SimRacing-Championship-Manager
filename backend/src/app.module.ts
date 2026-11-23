import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RacesModule } from './races/races.module.js';

@Module({
  imports: [RacesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
