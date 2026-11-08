import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateStallDto {
  @ApiProperty({
    example: 'Kantin Bu Sari',
    description: 'Nama stan kantin (wajib unik)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nama stan wajib diisi' })
  @MaxLength(150)
  name: string;

  @ApiProperty({
    example: 'Gedung A Lantai 1 - Stan No. 3',
    description: 'Lokasi stan di dalam area kampus',
  })
  @IsString()
  @IsNotEmpty({ message: 'Lokasi stan wajib diisi' })
  @MaxLength(255)
  location: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Status operasional stan (buka/tutup)',
  })
  @IsOptional()
  @IsBoolean()
  is_open?: boolean;
}
