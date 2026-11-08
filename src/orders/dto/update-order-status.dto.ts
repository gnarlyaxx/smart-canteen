import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import type { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: 'processing',
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    description: 'Status pesanan baru (pending | processing | completed | cancelled)',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['pending', 'processing', 'completed', 'cancelled'], {
    message:
      'order_status harus salah satu dari: pending, processing, completed, cancelled',
  })
  order_status: OrderStatus;
}
