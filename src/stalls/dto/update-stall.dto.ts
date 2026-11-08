import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateStallDto {
  @ApiPropertyOptional({
    example: 'Kantin Bu Sari Nusantara',
    description: 'Nama stan kantin (wajib unik)',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({
    example: 'Gedung B Lantai Dasar - Stan No. 1',
    description: 'Lokasi stan di dalam area kampus',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Status operasional stan (buka/tutup)',
  })
  @IsOptional()
  @IsBoolean()
  is_open?: boolean;
}
