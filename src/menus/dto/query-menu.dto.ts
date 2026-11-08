import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import type { MenuCategory } from '../entities/menu.entity';
import { Menu } from '../entities/menu.entity';

export class QueryMenuDto {
  @ApiPropertyOptional({
    example: 'makanan',
    enum: ['makanan', 'minuman', 'snack'],
    description: 'Filter berdasarkan kategori menu',
  })
  @IsOptional()
  @IsString()
  @IsIn(['makanan', 'minuman', 'snack'], {
    message: 'category harus salah satu dari: makanan, minuman, snack',
  })
  category?: MenuCategory;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter berdasarkan ID stan kantin',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stall_id?: number;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Filter batas harga minimum',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  min_price?: number;

  @ApiPropertyOptional({
    example: 25000,
    description: 'Filter batas harga maksimum',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  max_price?: number;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Nomor halaman (Offset Pagination, dimulai dari 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: 'Jumlah item per halaman (default 10, maksimal 100)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'price:asc,id:asc',
    description:
      'Parameter sorting dengan format field:direction (contoh: price:asc,id:asc). Default: created_at:desc,id:asc',
  })
  @IsOptional()
  @IsString()
  sort?: string;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 25, description: 'Total seluruh item yang cocok dengan filter' })
  total_items: number;

  @ApiProperty({ example: 10, description: 'Jumlah item pada halaman saat ini' })
  item_count: number;

  @ApiProperty({ example: 10, description: 'Batas jumlah item per halaman (limit)' })
  items_per_page: number;

  @ApiProperty({ example: 3, description: 'Total halaman yang tersedia' })
  total_pages: number;

  @ApiProperty({ example: 1, description: 'Halaman saat ini (page)' })
  current_page: number;
}

export class PaginatedMenuResponseDto {
  @ApiProperty({ type: [Menu], description: 'Daftar data menu pada halaman ini' })
  data: Menu[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Metadata offset pagination' })
  meta: PaginationMetaDto;
}
