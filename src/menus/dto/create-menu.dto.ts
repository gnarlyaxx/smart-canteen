import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateMenuDto {
  @ApiProperty({
    example: 1,
    description: 'ID stan kantin tempat menu dijual',
  })
  @Type(() => Number)
  @IsInt({ message: 'stall_id harus berupa bilangan bulat' })
  @Min(1)
  stall_id: number;

  @ApiProperty({
    example: 'Nasi Goreng Spesial Kampus',
    description: 'Nama menu (wajib unik)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nama menu wajib diisi' })
  @MaxLength(150)
  name: string;

  @ApiProperty({
    example: 'makanan',
    enum: ['makanan', 'minuman', 'snack'],
    description: 'Kategori menu (makanan | minuman | snack)',
  })
  @IsString()
  @IsIn(['makanan', 'minuman', 'snack'], {
    message: 'category harus salah satu dari: makanan, minuman, snack',
  })
  category: MenuCategory;

  @ApiProperty({
    example: 15000,
    minimum: 1000,
    description: 'Harga satuan menu dalam Rupiah (minimal Rp 1.000)',
  })
  @Type(() => Number)
  @IsInt({ message: 'Harga harus berupa bilangan bulat' })
  @Min(1000, { message: 'Harga menu minimal adalah 1000' })
  price: number;

  @ApiProperty({
    example: 25,
    minimum: 0,
    description: 'Stok menu tersedia (minimal 0)',
  })
  @Type(() => Number)
  @IsInt({ message: 'Stok harus berupa bilangan bulat' })
  @Min(0, { message: 'Stok menu tidak boleh negatif (minimal 0)' })
  stock: number;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Status ketersediaan menu',
  })
  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}
