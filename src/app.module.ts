import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Menu } from './menus/entities/menu.entity';
import { MenusModule } from './menus/menus.module';
import { OrderItem } from './orders/entities/order-item.entity';
import { Order } from './orders/entities/order.entity';
import { OrdersModule } from './orders/orders.module';
import { Stall } from './stalls/entities/stall.entity';
import { StallsModule } from './stalls/stalls.module';

function buildTypeOrmOptions(): TypeOrmModuleOptions {
  const isTest =
    process.env.NODE_ENV === 'test' || process.env.DB_TYPE === 'sqljs';

  if (isTest) {
    return {
      type: 'sqljs',
      entities: [Stall, Menu, Order, OrderItem],
      synchronize: true,
      dropSchema: true,
    };
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME ?? 'smart_canteen_db',
    entities: [Stall, Menu, Order, OrderItem],
    synchronize: process.env.DB_SYNCHRONIZE !== 'false',
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => buildTypeOrmOptions(),
    }),
    StallsModule,
    MenusModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
