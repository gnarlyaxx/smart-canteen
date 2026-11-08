import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly ormRepo: Repository<Order>,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.ormRepo.find({
      relations: { items: true },
      order: { created_at: 'DESC', id: 'ASC' },
    });
  }

  async findById(id: number): Promise<Order | null> {
    return this.ormRepo.findOne({
      where: { id },
      relations: { items: true },
    });
  }

  async updateStatus(order: Order, status: OrderStatus): Promise<Order> {
    order.order_status = status;
    return this.ormRepo.save(order);
  }
}
