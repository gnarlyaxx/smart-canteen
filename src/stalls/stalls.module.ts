import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stall } from './entities/stall.entity';
import { StallsController } from './stalls.controller';
import { StallsRepository } from './stalls.repository';
import { StallsService } from './stalls.service';

@Module({
  imports: [TypeOrmModule.forFeature([Stall])],
  controllers: [StallsController],
  providers: [StallsRepository, StallsService],
  exports: [StallsService, StallsRepository],
})
export class StallsModule {}
