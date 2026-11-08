import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Membuat pesanan baru dengan Database Transaction (QueryRunner)',
    description:
      'Memvalidasi ketersediaan setiap menu_id dan stok secara transaksional. Jika salah satu item tidak ditemukan (404) atau stok kurang (400), seluruh pemotongan stok di-rollback.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pesanan berhasil dibuat dan stok menu berhasil dikurangi',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validasi gagal atau stok menu tidak mencukupi (transaksi di-rollback)',
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Salah satu menu_id tidak ditemukan (transaksi di-rollback)',
    type: ProblemDetailsDto,
  })
  async create(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Mengambil daftar seluruh pesanan kantin' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Daftar pesanan berhasil diambil',
    type: [Order],
  })
  async findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mengambil detail pesanan beserta item berdasarkan ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detail pesanan ditemukan',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pesanan tidak ditemukan',
    type: ProblemDetailsDto,
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Memperbarui status pesanan (pending | processing | completed | cancelled)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status pesanan berhasil diperbarui',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Status pesanan tidak valid',
    type: ProblemDetailsDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pesanan tidak ditemukan',
    type: ProblemDetailsDto,
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, dto);
  }
}
