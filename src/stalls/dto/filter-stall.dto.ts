import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class FilterStallDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Filter stan berdasarkan status operasional (true/false)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'is_open harus berupa nilai boolean (true atau false)' })
  is_open?: boolean;
}
