import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

@Entity('orders')
export class Order {
  @ApiProperty({ example: 1, description: 'ID unik pesanan' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Budi Santoso',
    description: 'Nama pemesan (mahasiswa/dosen/staf)',
  })
  @Column({ type: 'varchar', length: 150, nullable: false })
  customer_name: string;

  @ApiProperty({
    example: 'A-12',
    description: 'Nomor meja kantin',
  })
  @Column({ type: 'varchar', length: 50, nullable: false })
  table_number: string;

  @ApiProperty({
    example: 'pending',
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending',
    description: 'Status pesanan saat ini',
  })
  @Column({ type: 'varchar', length: 30, default: 'pending', nullable: false })
  order_status: OrderStatus;

  @ApiProperty({
    example: 35000,
    description: 'Total harga keseluruhan pesanan dalam Rupiah',
  })
  @Column({ type: 'int', nullable: false })
  total_price: number;

  @ApiProperty({
    example: '2026-11-08T10:15:00.000Z',
    description: 'Waktu pembuatan pesanan',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    type: () => [OrderItem],
    description: 'Daftar item menu yang dipesan',
  })
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];
}
