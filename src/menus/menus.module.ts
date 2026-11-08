import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StallsModule } from '../stalls/stalls.module';
import { Menu } from './entities/menu.entity';
import { MenusController } from './menus.controller';
import { MenusRepository } from './menus.repository';
import { MenusService } from './menus.service';

@Module({
  imports: [TypeOrmModule.forFeature([Menu]), StallsModule],
  controllers: [MenusController],
  providers: [MenusRepository, MenusService],
  exports: [MenusService, MenusRepository],
})
export class MenusModule {}
