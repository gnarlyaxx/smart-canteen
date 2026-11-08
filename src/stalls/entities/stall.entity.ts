import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Menu } from '../../menus/entities/menu.entity';

@Entity('stalls')
export class Stall {
  @ApiProperty({ example: 1, description: 'ID unik stan kantin' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Kantin Bu Sari',
    description: 'Nama stan kantin (unik)',
  })
  @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
  name: string;

  @ApiProperty({
    example: 'Gedung A Lantai 1 - Stan No. 3',
    description: 'Lokasi stan di area kampus',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  location: string;

  @ApiProperty({
    example: true,
    description: 'Status operasional buka/tutup stan kantin',
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  is_open: boolean;

  @ApiProperty({
    example: '2026-11-08T10:00:00.000Z',
    description: 'Waktu pembuatan data stan',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    example: '2026-11-08T10:00:00.000Z',
    description: 'Waktu pembaruan terakhir data stan',
  })
  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Menu, (menu) => menu.stall)
  menus: Menu[];
}
