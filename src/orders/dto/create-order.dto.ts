import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({
    example: 1,
    description: 'ID menu yang dipesan',
  })
  @Type(() => Number)
  @IsInt({ message: 'menu_id harus berupa bilangan bulat' })
  @Min(1)
  menu_id: number;

  @ApiProperty({
    example: 2,
    minimum: 1,
    description: 'Jumlah porsi yang dipesan (minimal 1)',
  })
  @Type(() => Number)
  @IsInt({ message: 'quantity harus berupa bilangan bulat' })
  @Min(1, { message: 'quantity minimal adalah 1' })
  quantity: number;

  @ApiPropertyOptional({
    example: 'Pedas sedang',
    description: 'Catatan khusus untuk item menu',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}

export class CreateOrderDto {
  @ApiProperty({
    example: 'Budi Santoso',
    description: 'Nama lengkap pemesan',
  })
  @IsString()
  @IsNotEmpty({ message: 'customer_name wajib diisi' })
  @MaxLength(150)
  customer_name: string;

  @ApiProperty({
    example: 'A-12',
    description: 'Nomor meja kantin tempat pemesan duduk',
  })
  @Transform(({ value }) =>
    value !== undefined && value !== null ? String(value) : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'table_number wajib diisi' })
  @MaxLength(50)
  table_number: string;

  @ApiProperty({
    type: [CreateOrderItemDto],
    description: 'Daftar item menu yang dipesan (minimal 1 item)',
  })
  @IsArray({ message: 'items harus berupa array' })
  @ArrayMinSize(1, { message: 'Pesanan wajib memiliki minimal 1 item menu' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
