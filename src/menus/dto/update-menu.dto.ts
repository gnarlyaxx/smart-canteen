import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import type { MenuCategory } from '../entities/menu.entity';

export class UpdateMenuDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'ID stan kantin tempat menu dijual',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stall_id?: number;

  @ApiPropertyOptional({
    example: 'Nasi Goreng Spesial Kampus Jumbo',
    description: 'Nama menu (wajib unik)',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({
    example: 'makanan',
    enum: ['makanan', 'minuman', 'snack'],
    description: 'Kategori menu (makanan | minuman | snack)',
  })
  @IsOptional()
  @IsString()
  @IsIn(['makanan', 'minuman', 'snack'], {
    message: 'category harus salah satu dari: makanan, minuman, snack',
  })
  category?: MenuCategory;

  @ApiPropertyOptional({
    example: 18000,
    minimum: 1000,
    description: 'Harga satuan menu dalam Rupiah (minimal Rp 1.000)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1000, { message: 'Harga menu minimal adalah 1000' })
  price?: number;

  @ApiPropertyOptional({
    example: 30,
    minimum: 0,
    description: 'Stok menu tersedia (minimal 0)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Stok menu tidak boleh negatif (minimal 0)' })
  stock?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Status ketersediaan menu',
  })
  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}
