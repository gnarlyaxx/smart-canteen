import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Menu } from '../menus/entities/menu.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.findAll();
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Pesanan dengan ID ${id} tidak ditemukan`);
    }
    return order;
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalPrice = 0;
      const preparedItems: Array<{
        menu_id: number;
        quantity: number;
        price: number;
        subtotal: number;
        notes: string | null;
      }> = [];

      for (const itemDto of dto.items) {
        const menu = await queryRunner.manager.findOne(Menu, {
          where: { id: itemDto.menu_id },
        });

        if (!menu) {
          throw new NotFoundException(
            `Menu dengan ID ${itemDto.menu_id} tidak ditemukan`,
          );
        }

        if (menu.stock < itemDto.quantity) {
          throw new BadRequestException(
            `Stok menu tidak mencukupi untuk '${menu.name}' (tersedia: ${menu.stock}, diminta: ${itemDto.quantity})`,
          );
        }

        menu.stock -= itemDto.quantity;
        if (menu.stock === 0) {
          menu.is_available = false;
        }
        await queryRunner.manager.save(Menu, menu);

        const subtotal = menu.price * itemDto.quantity;
        totalPrice += subtotal;

        preparedItems.push({
          menu_id: menu.id,
          quantity: itemDto.quantity,
          price: menu.price,
          subtotal,
          notes: itemDto.notes ?? null,
        });
      }

      const orderEntity = queryRunner.manager.create(Order, {
        customer_name: dto.customer_name,
        table_number: dto.table_number,
        order_status: 'pending',
        total_price: totalPrice,
      });
      const savedOrder = await queryRunner.manager.save(Order, orderEntity);

      const orderItems: OrderItem[] = [];
      for (const prepared of preparedItems) {
        const orderItemEntity = queryRunner.manager.create(OrderItem, {
          order_id: savedOrder.id,
          menu_id: prepared.menu_id,
          quantity: prepared.quantity,
          price: prepared.price,
          subtotal: prepared.subtotal,
          notes: prepared.notes,
        });
        const savedItem = await queryRunner.manager.save(
          OrderItem,
          orderItemEntity,
        );
        orderItems.push(savedItem);
      }

      await queryRunner.commitTransaction();

      savedOrder.items = orderItems;
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    return this.ordersRepository.updateStatus(order, dto.order_status);
  }
}
