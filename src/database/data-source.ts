import * as path from 'node:path';
import { DataSource } from 'typeorm';
import { Menu } from '../menus/entities/menu.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { Stall } from '../stalls/entities/stall.entity';
import { InitialSmartCanteenSchema1730000000000 } from './migrations/1730000000000-InitialSmartCanteenSchema';

try {
  process.loadEnvFile?.(path.resolve(process.cwd(), '.env'));
} catch {
  // .env optional if environment variables are already provided
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? 'smart_canteen_db',
  entities: [Stall, Menu, Order, OrderItem],
  migrations: [InitialSmartCanteenSchema1730000000000],
  synchronize: false,
});
