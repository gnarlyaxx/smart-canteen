import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Stall } from '../../stalls/entities/stall.entity';

export type MenuCategory = 'makanan' | 'minuman' | 'snack';

@Entity('menus')
export class Menu {
  @ApiProperty({ example: 1, description: 'ID unik menu kantin' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: 'ID stan pemilik menu (FK ke stalls.id)' })
  @Column({ type: 'int', nullable: false })
  stall_id: number;

  @ManyToOne(() => Stall, (stall) => stall.menus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stall_id' })
  stall: Stall;

  @ApiProperty({
    example: 'Nasi Goreng Spesial Kampus',
    description: 'Nama menu (wajib unik)',
  })
  @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
  name: string;

  @ApiProperty({
    example: 'makanan',
    enum: ['makanan', 'minuman', 'snack'],
    description: 'Kategori menu kantin',
  })
  @Column({ type: 'varchar', length: 50, nullable: false })
  category: MenuCategory;

  @ApiProperty({
    example: 15000,
    minimum: 1000,
    description: 'Harga menu dalam Rupiah (minimal 1000)',
  })
  @Column({ type: 'int', nullable: false })
  price: number;

  @ApiProperty({
    example: 25,
    minimum: 0,
    description: 'Jumlah stok porsi yang tersedia (minimal 0)',
  })
  @Column({ type: 'int', nullable: false })
  stock: number;

  @ApiProperty({
    example: true,
    default: true,
    description: 'Status ketersediaan menu',
  })
  @Column({ type: 'boolean', default: true })
  is_available: boolean;

  @ApiProperty({
    example: 1,
    description: 'Versi record untuk ETag dan Optimistic Locking',
  })
  @VersionColumn()
  version: number;

  @ApiProperty({
    example: '2026-11-08T10:00:00.000Z',
    description: 'Waktu pembuatan menu',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    example: '2026-11-08T10:00:00.000Z',
    description: 'Waktu pembaruan terakhir menu',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
