import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Menu } from '../../menus/entities/menu.entity';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @ApiProperty({ example: 1, description: 'ID unik item pesanan' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: 'ID pesanan induk (FK ke orders.id)' })
  @Column({ type: 'int', nullable: false })
  order_id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ApiProperty({ example: 1, description: 'ID menu yang dipesan (FK ke menus.id)' })
  @Column({ type: 'int', nullable: false })
  menu_id: number;

  @ManyToOne(() => Menu, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'menu_id' })
  menu: Menu;

  @ApiProperty({ example: 2, description: 'Jumlah porsi yang dipesan' })
  @Column({ type: 'int', nullable: false })
  quantity: number;

  @ApiProperty({
    example: 15000,
    description: 'Harga satuan menu pada saat transaksi berlangsung',
  })
  @Column({ type: 'int', nullable: false })
  price: number;

  @ApiProperty({
    example: 30000,
    description: 'Subtotal harga item (quantity * price)',
  })
  @Column({ type: 'int', nullable: false })
  subtotal: number;

  @ApiPropertyOptional({
    example: 'Pedas sedang, tanpa bawang goreng',
    nullable: true,
    description: 'Catatan tambahan untuk item pesanan',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  notes: string | null;
}
